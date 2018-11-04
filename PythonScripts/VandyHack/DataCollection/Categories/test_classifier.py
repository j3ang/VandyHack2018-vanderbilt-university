import pickle
import nltk
from collections import Counter
import re
import numpy as np
from itertools import chain, combinations

classifier = pickle.load(open('classifiers/MNB.pickle', 'rb'))

def token_feature(doc_tokens, k=3):
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

def predict_topic(s):
    token = tokenize(s)
    a = classifier.prob_classify(token_feature(token))

    print(a.prob(a.max()))
    
    return classifier.classify(token_feature(token))



def run_this():
    ip = input("Enter statement\n")
    topic = predict_topic(ip)
    print(topic)
    ch = input('Do you wanna try again(y/n)?')
    if(ch == 'Y' or ch == 'y'):
        run_this()
    


def main():

    run_this()
    

if __name__ == '__main__':
    main()

