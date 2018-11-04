import re
import numpy as np
import json
import random
import nltk
import pickle
from collections import Counter
from nltk.classify.scikitlearn import SklearnClassifier
from sklearn.svm import LinearSVC
import pandas as pd
from itertools import chain, combinations
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


classifiers =  { "NaiveBayes":nltk.NaiveBayesClassifier,"MNB":SklearnClassifier(MultinomialNB()),"LinearSVC":SklearnClassifier(LinearSVC())}
topics = ['Sports', 'Entertainment','Technology','Health','Politics','Food']


all_tokens = []
documents = []
X = []
Y = []

def tokenize(doc, keep_internal_punct=True):
    content = []
    with open('stopwords.txt') as f:
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

def token_feature(doc_tokens, k=3):
    c = Counter(doc_tokens)
    feats = {}
    #token_feature
    for token in doc_tokens:
        feats['has(%s)'%(token)] = c[token]
        
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

def load_reddit_data(fname='Reddit/raw_reddit_data.json'):
    with open(fname) as f:
       j_text = f.read() 
       j_data = json.loads(j_text)
       for topic in topics:
           for doc in j_data[topic]:
               tokens = tokenize(doc)
               documents.append((tokens,topic))
               X.append(tokens)
               Y.append(topic)
               
def load_twitter_data(fname ="Reddit/twitter_category_data.json"):
    with open(fname) as f:
       j_text = f.read() 
       j_data = json.loads(j_text)
       for topic in topics:
           for doc in j_data[topic]:
               tokens = tokenize(doc)
               documents.append((tokens,topic))
               X.append(tokens)
               Y.append(topic)
               
               
def classify_store(classifier,label,train_set,test_set):
    model = classifier.train(train_set)
    accuracy_per = round(nltk.classify.accuracy(model, test_set) * 100,1)
    print("%s accuracy %d"%(label,accuracy_per))
    
    save_classifier = open("Classifiers/%s.pickle"%label,"wb")
    pickle.dump(model, save_classifier)
    save_classifier.close()
    

              
def main():
    load_reddit_data()
    load_twitter_data()
    random.seed(23493)
    random.shuffle(documents)
    
    featuresets = [(token_feature(d), c) for (d,c) in documents]
    
    split = int(len(featuresets)* 0.333)
    

    train_set, test_set = featuresets[split:], featuresets[:split]

    print("Training Data Set length : %d, Testing Data Set length : %d"%(len(train_set), len(test_set)))

    #X_train, X_test, y_train, y_test = train_test_split(X, Y, test_size=0.33, random_state=42)

    for key in classifiers:
           classify_store(classifiers[key],key,train_set,test_set)
    

if __name__ == '__main__':
    main()