# -*- coding: utf-8 -*-

from pandas import DataFrame, read_csv
import pandas as pd
import requests
import json
from collections import defaultdict
import MySQLdb

topic_file = r'reddit_topics.csv'
raw_output_file_name = "raw_reddit_data.json"

user_agent= {'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
           'Accept-Encoding': 'gzip, deflate, sdch',
           'Accept-Language': 'en-US,en;q=0.8',
           'Upgrade-Insecure-Requests': '1',
           'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0'}


db = MySQLdb.connect(host="54.149.198.224",  # your host
                     user="root",       # username
                     passwd="Vandyhack",     # password
                     db="tip")   # name of the database

cur = db.cursor()


def getPosts(topic):

    df = pd.read_csv(topic_file)
    posts = []
    for topic in df[topic].dropna():
        url = "https://www.reddit.com/r/%s/.json?limit=100"%(topic)
        print(url)
        response = requests.get(url, headers=user_agent)
        for post in response.json()['data']['children']:
            if post['data']['title'] not in posts:
                posts.append(post['data']['title'])

    return posts


def collectRawData():
    topics = ['Sports', 'Entertainment','Technology','Health','Politics','Food']
    rawdata= defaultdict(lambda:0)
    for topic in topics:
        print("Retriving the topic %s."%(topic))
        rawdata[topic] = getPosts(topic)


    j = json.dumps(rawdata)
    f = open(raw_output_file_name,"w")
    f.write(j)
    f.close()

def collectServerData():
    topics = ['Sports', 'Entertainment','Technology','Health','Politics','Food']
    rawdata= defaultdict(lambda:0)
    for topic in topics:
        cur.execute("select Text from CategoryTweets where Category='%s'"%(topic))
        row = cur.fetchone()
        lines = []
        while row is not None:
            lines.append(row[0])
            row = cur.fetchone()
        rawdata[topic] = lines
        print("Retrived the data for the topic %s"%(topic))

    j = json.dumps(rawdata)
    f = open("twitter_category_data.json","w")
    f.write(j)
    f.close()

def main():
    collectRawData()
    collectServerData()

if __name__ == '__main__':
    main()
