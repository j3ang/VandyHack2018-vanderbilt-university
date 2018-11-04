import sys
import time
import re
from TwitterAPI import TwitterAPI
import pandas as pd
import threading

consumer_key = 'H7eMmD0gFHHEXRx2GOguhwzRk'
consumer_secret = 'mVkbN2NtPVwXparvC8QXJtXikkysNgWGlbSe8WPQUutbYzTRQJ'
access_token = '1057211984171753477-MM06405qOcZN2G9AgpCLgsjswmDaCm'
access_token_secret = 'QQBfnyMpq7lAMLDLYOWRSH8FH0wDTjsslvn5j2AvbEq9D'

import MySQLdb

db = MySQLdb.connect(host="54.149.198.224",  # your host 
                     user="root",       # username
                     passwd="Vandyhack",     # password
                     db="tip")   # name of the database

cur = db.cursor()

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
    result = robust_request(twitter, 'followers/ids', {'screen_name' : screen_name, 'count' : 2000, 'cursor' : '-1'})
    
    for id in result:
        ids.append(id)

    return sorted(ids)

def get_statuses(twitter, u_id, cat):
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
    for f in followers:
        get_statuses(twitter, f,chandle)



def main():
    api = get_twitter()
    
    celeb_file = r'target_celebs.csv'
    tc = pd.read_csv(celeb_file)
    
    for i in range(0,10):
        try:
            u = tc['handles'][i]
            u = u.strip()
            followers = get_followers(api,u)
            get_follower_statuses(api,followers,u)
        except Exception as e:
            print("Error: unable to start thread",e)



if __name__ == '__main__':
    main()
