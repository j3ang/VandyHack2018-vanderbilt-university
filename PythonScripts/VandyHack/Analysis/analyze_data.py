import re
import pandas as pd
import MySQLdb
import pickle
from collections import Counter
import numpy as np
from itertools import chain, combinations



db = MySQLdb.connect(host="54.149.198.224",  # your host 
                     user="root",       # username
                     passwd="Vandyhack",     # password
                     db="tip")   # name of the database


db2 = MySQLdb.connect(host="54.149.198.224",  # your host 
                     user="root",       # username
                     passwd="Vandyhack",     # password
                     db="tip")   # name of the database

cur = db.cursor()
cur2 = db2.cursor()


classifier_senti = pickle.load(open('classifiers/MNBSenti.pickle', 'rb'))
classifier_cat = pickle.load(open('classifiers/MNBCat.pickle', 'rb'))


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


def token_featureSenti(doc_tokens, k=3):
    c = Counter(doc_tokens)
    feats = {}
    for token in doc_tokens:
        feats['has(%s)'%(token)] = c[token]

    #lexicon feature
    n = 0;
    p = 0;
    for token in doc_tokens:
        if token.lower() in neg_words:
            n += 1
        if token.lower() in pos_words:
            p += 1
    feats['neg_words'] = n
    feats['pos_words'] = p
    
    #token_pair_feature
    for i in range(0, len(doc_tokens) - k + 1):
        a = doc_tokens[i : i + k]
        for co in combinations(a,2):
            key = 'token_pair=%s__%s' % (co[0],co[1])
            if key in feats:
                feats[key] = feats[key] + 1
            else:
                feats[key] = 1
                
    return feats

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



def predict_senti_topic(s):
    token = tokenize(s, keep_internal_punct=False, for_sentiment = True)
    a = classifier_senti.prob_classify(token_featureSenti(token))
    
    p = a.prob(a.max())
    if p < 0.50:
        return 0

    return classifier_senti.classify(token_featureSenti(token))


def predict_cat_topic(s):
    token = tokenize(s, keep_internal_punct=False, for_sentiment = False)
    a = classifier_cat.prob_classify(token_featureCat(token))
    p = a.prob(a.max())
    
    if p < 0.50:
        return "NoClass"
    
    return classifier_cat.classify(token_featureCat(token))


def run_analysis():
    cur.execute("select Id, Text from FollowersTweets where PredCategory is NULL")
    row = cur.fetchone()
    print("Analyzing tweets and updating the DB...");
    while row is not None:
        id = row[0]
        line = row[1]
        row = cur.fetchone()
        cat = predict_cat_topic(line)
        cur2.execute("update FollowersTweets set PredCategory='%s' where Id=%s"%(cat,id))
        db2.commit()
    
    
    print("Analysis complete")


def main():
    run_analysis()
    global pos_words
    global neg_words
    with open("positive_words.txt") as f:
        content = f.readlines()
        pos_words = set([x.strip() for x in content]) 
    

    with open("negative_words.txt") as f:
        content = f.readlines()
        neg_words = set([x.strip() for x in content])
        
    

if __name__ == '__main__':
    main()