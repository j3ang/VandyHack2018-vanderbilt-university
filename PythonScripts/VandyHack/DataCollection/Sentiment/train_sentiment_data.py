
import re
import pandas as pd
import numpy as np
import random
import nltk
import pickle
from collections import Counter
from nltk.classify.scikitlearn import SklearnClassifier
from sklearn.svm import LinearSVC
from sklearn.naive_bayes import MultinomialNB
from itertools import chain, combinations
from sklearn.feature_extraction.text import TfidfVectorizer


topics = ['-1', '1','0']
all_tokens = []
documents = []

neg_words = set(['bad', 'hate', 'horrible', 'worst', 'boring'])
pos_words = set(['awesome', 'amazing', 'best', 'good', 'great', 'love', 'wonderful', 'nice', 'wow'])

classifiers =  {"NaiveBayes":nltk.NaiveBayesClassifier,"LinearSVC":SklearnClassifier(LinearSVC()),"MNB":SklearnClassifier(MultinomialNB(alpha=1.0, class_prior=None, fit_prior=True))}

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


def load_documents(fname='trained_data.csv'):
    with open(fname, "r", encoding="utf8") as f:
        df = pd.read_csv(f)
        for i, row in df.iterrows():
            tokens = tokenize(row['Texts'])
            documents.append((tokens,row['Polarity']))


def token_feature(doc_tokens, k=2):
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


def classify_store(classifier,label,train_set,test_set):
    model = classifier.train(train_set)
    accuracy_per = round(nltk.classify.accuracy(model, test_set) * 100,1)
    print("%s accuracy %d"%(label,accuracy_per))

    save_classifier = open("classifiers/%s.pickle"%label,"wb")
    pickle.dump(model, save_classifier)
    save_classifier.close()



def main():
    global pos_words
    global neg_words
    with open("positive_words.txt") as f:
        content = f.readlines()
        pos_words = set([x.strip() for x in content])


    with open("negative_words.txt") as f:
        content = f.readlines()
        neg_words = set([x.strip() for x in content])

    load_documents()
    random.seed(78956)
    random.shuffle(documents)

    featuresets = [(token_feature(d), c) for (d,c) in documents]


    train_set, test_set = featuresets[1500:], featuresets[:1500]
    print("Training Data Set length : %d, Testing Data Set length : %d"%(len(train_set), len(test_set)))

    for key in classifiers:
        classify_store(classifiers[key],key,train_set,test_set)


if __name__ == '__main__':
    main()
