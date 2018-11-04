# -*- coding: utf-8 -*-

import threading
import re
import pandas as pd
from tweepy import Stream
from tweepy import OAuthHandler
from tweepy.streaming import StreamListener
import MySQLdb

db = MySQLdb.connect(host="54.149.198.224",  # your host 
                     user="root",       # username
                     passwd="Vandyhack",     # password
                     db="tip")   # name of the database

cur = db.cursor()

class mylistener(StreamListener):

    def __init__(self,filename):
        StreamListener.__init__(self)
        self.mfilename = filename
        self.u_ids = []
        self.u_names = []
        self.u_texts = []
        self.u_cords = []
        self.u_followers = []
        self.s_reply_count = []
        self.s_retweet_count = []
        self.s_fav_count = []
        self.count = 0;

    def on_status(self, status):
        if hasattr(status,'retweeted_status'):
            return

        user_id = str(status.user.id_str)
        user_screen_name = status.user.screen_name
        text = status.text
        coords = status.coordinates
        followers = status.user.followers_count
        reply_count = status.reply_count
        retweet_count = status.retweet_count
        favorite_count = status.favorite_count
        
        if (followers > 30):

            text = re.sub(r'[^\w\s]','',text)
            text = re.sub(" \d+", " ", text)
            text = re.sub('@\S+', ' ', text)  # Remove mentions.
            text = re.sub('http\S+', ' ', text)  # Remove urls.
            text = re.sub('[^A-Za-z0-9]+', " ",text) #Remove all special characters

            if text not in self.u_texts and text.strip() != "" and len(text.split()) > 4:
                self.u_ids.append(user_id)
                self.u_names.append(user_screen_name)
                self.u_texts.append(text)
                self.u_cords.append(coords)
                self.u_followers.append(followers)
                self.s_reply_count.append(reply_count)
                self.s_retweet_count.append(retweet_count)
                self.s_fav_count.append(favorite_count)
                

                if(len(self.u_ids) > 50):
                    
                    try:
                       values =  []
                       for j in range(0,50):
                           tup = (self.u_texts[j],self.u_cords[j],self.u_followers[j],self.u_names[j],self.u_ids[j],self.s_reply_count[j],self.s_retweet_count[j],self.s_fav_count[j], self.mfilename);
                           values.append(tup)
                      
                       cur.executemany(
                          """INSERT INTO GossipTweets (Text, Location, Followers, Screen_name, User_id, Reply_count, Retweet_count, Fav_count, Category)
                          VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s )""", values)
                       
                       db.commit()
                        
                    except (MySQLdb.Error, MySQLdb.Warning) as e:
                       print(e)
                    
                    self.u_ids.clear()
                    self.u_names.clear()
                    self.u_texts.clear()
                    self.u_cords.clear()
                    self.u_followers.clear()
                    self.s_reply_count.clear()
                    self.s_retweet_count.clear()
                    self.s_fav_count.clear()
                    self.count += 50
                    print("Wrote 50 for %s"%(self.mfilename))



    def on_error(self, status_code):
        print("Error", status_code)
        if status_code == 420:
            return False

def stream_user(auth1,filename,keywords):
    print("Starting Stream for %s\n"%(keywords))
    stream = Stream(auth1, mylistener(filename))
    stream.filter(track=keywords)

def main():
    file = r'twitter.csv'
    tw = pd.read_csv(file)
    
    celeb_file = r'target_celebs.csv'
    tc = pd.read_csv(celeb_file)
    
    auth1 = OAuthHandler(tw['api_key'][3].strip(), tw['api_sec'][3].strip())
    auth1.set_access_token(tw['acc_token'][3].strip(), tw['acc_sec'][3].strip())
    
    auth2 = OAuthHandler(tw['api_key'][4].strip(), tw['api_sec'][4].strip())
    auth2.set_access_token(tw['acc_token'][4].strip(), tw['acc_sec'][4].strip())
    
    auth3 = OAuthHandler(tw['api_key'][5].strip(), tw['api_sec'][5].strip())
    auth3.set_access_token(tw['acc_token'][5].strip(), tw['acc_sec'][5].strip())
    
    auth4 = OAuthHandler(tw['api_key'][6].strip(), tw['api_sec'][6].strip())
    auth4.set_access_token(tw['acc_token'][6].strip(), tw['acc_sec'][6].strip())
    
    auth5 = OAuthHandler(tw['api_key'][7].strip(), tw['api_sec'][7].strip())
    auth5.set_access_token(tw['acc_token'][7].strip(), tw['acc_sec'][7].strip())
    
    auths = [auth1, auth2, auth3, auth4, auth5]
    
    threads = []
    
    for i in range(0,10):
        try:
            u = tc['handles'][i]
            t = threading.Thread(target = stream_user, args = (auths[i%5],u.strip(),[u.strip()] ))
            threads.append(t)
            t.start()
        except Exception as e:
            print("Error: unable to start thread",e)
        
        
    for t in threads:
        t.join()

if __name__ == '__main__':
    main()
