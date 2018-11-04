import pickle
import nltk
from collections import Counter
import re
import numpy as np
from itertools import chain, combinations

classifier = pickle.load(open('classifiers/MNB.pickle', 'rb'))

neg_words = set(['bad', 'hate', 'horrible', 'worst', 'boring'])
pos_words = set(['awesome', 'amazing', 'best', 'good', 'great', 'love', 'wonderful'])

def token_feature(doc_tokens, k=3):
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


def tokenize(doc, keep_internal_punct=False):
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
    print(token)
    a = classifier.prob_classify(token_feature(token))

    print(a.prob(a.max()))
    return classifier.classify(token_feature(token))



def run_this():
    ip = input("Enter statement ")
    topic = predict_topic(ip)
    print(topic)
    ch = input('You wanna try again? ')
    if(ch == 'Y' or ch == 'y'):
        run_this()
    
    

    
    
def main():
    global pos_words
    global neg_words
    with open("positive_words.txt") as f:
        content = f.readlines()
        pos_words = set([x.strip() for x in content]) 
    

    with open("negative_words.txt") as f:
        content = f.readlines()
        neg_words = set([x.strip() for x in content])
        
    
    run_this()

if __name__ == '__main__':
    main()
