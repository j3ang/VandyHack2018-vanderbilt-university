import sys
import time
import re
from TwitterAPI import TwitterAPI
import pandas as pd
import threading
import pickle
import MySQLdb
from collections import Counter
import numpy as np
from itertools import chain, combinations


consumer_key = 'H7eMmD0gFHHEXRx2GOguhwzRk'
consumer_secret = 'mVkbN2NtPVwXparvC8QXJtXikkysNgWGlbSe8WPQUutbYzTRQJ'
access_token = '1057211984171753477-MM06405qOcZN2G9AgpCLgsjswmDaCm'
access_token_secret = 'QQBfnyMpq7lAMLDLYOWRSH8FH0wDTjsslvn5j2AvbEq9D'


#with warnings.catch_warnings():
#      warnings.simplefilter("ignore", category=UserWarning)
#      estimator = pickle.load(open('classifiers/MNB.pickle', 'rb'))
#
#
#classifier_cat = pickle.load(open('classifiers/MNB.pickle', 'rb'))

def get_twitter():
    return TwitterAPI(consumer_key, consumer_secret, access_token, access_token_secret)


def robust_request(twitter, resource, params, max_tries=5):
    for i in range(max_tries):
        request = twitter.request(resource, params)
        if request.status_code == 200:
            return request
        elif request.status_code == 429:
            print('Got error %s \nsleeping for 15 minutes.' % request.text)
            sys.stderr.flush()
            time.sleep(61 * 15)
        else:
            print("Got error %d"%(request.status_code))


def get_users(twitter, screen_names):

    request = robust_request(twitter, 'users/lookup', {'screen_name' : screen_names})
    return request


def get_followers(twitter, screen_name):

    ids = []
    result = robust_request(twitter, 'followers/ids', {'screen_name' : screen_name, 'count' : 5000, 'cursor' : '-1'})
    
    for id in result:
        ids.append(id)

    return sorted(ids)

def token_featureCat(doc_tokens, k=3):
    c = Counter(doc_tokens)
    feats = {}
    for token in doc_tokens:
        feats['has(%s)'%(token)] = c[token]
        
    for i in range(0, len(doc_tokens) - k + 1):
        a = doc_tokens[i : i + k]
        for co in combinations(a,2):
            key = 'token_pair=%s__%s' % (co[0],co[1])
            if key in feats:
                feats[key] = feats[key] + 1
            else:
                feats[key] = 1
        
    return feats

def tokenize(doc, keep_internal_punct=False, for_sentiment = True):
    content = []
    
    if for_sentiment == True:
        with open('stopwords_senti.txt') as f:
            content = f.readlines()
            content = [x.strip() for x in content]
        
    if for_sentiment == False:
        with open('stopwords_cat.txt') as f:
            content = f.readlines()
            content = [x.strip() for x in content]
    
    tokens = []
    doc = re.sub(r'[^\w\s]','',doc)
    doc = re.sub(" \d+", " ", doc)
    doc = re.sub('@\S+', ' ', doc)  # Remove mentions.
    doc = re.sub('http\S+', ' ', doc)  # Remove urls.
    
    if keep_internal_punct == False:
        tokens = np.array(re.findall('[\w_]+', doc.lower()))
    else:
        tokens = np.array(re.findall('[\w_][^\s]*[\w_]|[\w_]', doc.lower()))
      
           
    filtered_token_list = [i for i in tokens if i not in content]
    
    return list(filtered_token_list)


#def predict_cat_topic(s):
#    token = tokenize(s, keep_internal_punct=False, for_sentiment = False)
#    a = classifier_cat.prob_classify(token_featureCat(token))
#    p = a.prob(a.max())
#    
#    if p < 0.60:
#        return "NoClass"
#    
#    return classifier_cat.classify(token_featureCat(token))
#


def get_statuses(twitter, u_id, cat, cur, db):
     statuses = []
     cords = []
     result = robust_request(twitter, 'statuses/user_timeline', {'user_id' : u_id, 'count' : 5000, 'cursor' : '-1','include_rts':'false','exclude_replies':'true','trim_user':'true'})
     
     try:
         for status in result:
             text = status['text']
             text = re.sub(r'[^\w\s]','',text)
             text = re.sub(" \d+", " ", text)
             text = re.sub('@\S+', ' ', text)  # Remove mentions.
             text = re.sub('http\S+', ' ', text)  # Remove urls.
             text = re.sub('[^A-Za-z0-9]+', " ",text) #Remove all special characters
             if text != "" and len(text.split()) > 4:
                 statuses.append(text)
                 cord = status['coordinates']
                 #predictions.append(predict_cat_topic(text))
                 cords.append(cord)
             
         try:
             values =  []
             for j in range(0,len(statuses)):
                 tup = (statuses[j],cords[j],u_id,cat);
                 values.append(tup)
                      
             cur.executemany("""INSERT INTO FollowersTweets (Text, Location, User_id, Category)
             VALUES (%s, %s, %s, %s )""", values)
             db.commit()
             print("Wrote the %s lines for %s"%(len(statuses),cat))           
             
         except (MySQLdb.Error, MySQLdb.Warning) as e:
             print(e)
             
     except Exception as e:
         print("Error occured ",e)



def get_follower_statuses(twitter,followers, chandle):
    db = MySQLdb.connect(host="54.149.198.224",  # your host 
                     user="root",       # username
                     passwd="Vandyhack",     # password
                     db="tip")   # name of the database

    cur = db.cursor()

    for f in followers:
        get_statuses(twitter, f,chandle, cur, db)




def main():
    api = get_twitter()
    threads = []
    celeb_file = r'target_celebs.csv'
    tc = pd.read_csv(celeb_file)
    
    for i in range(0,10):
        try:
            u = tc['handles'][i]
            u = u.strip()
            followers = get_followers(api,u)
            t = threading.Thread(target = get_follower_statuses, args = (api,followers, u))
            threads.append(t)
            t.start()
            
        except Exception as e:
            print("Error: unable to start thread",e)

    for t in threads:
        t.join()

if __name__ == '__main__':
    main()
