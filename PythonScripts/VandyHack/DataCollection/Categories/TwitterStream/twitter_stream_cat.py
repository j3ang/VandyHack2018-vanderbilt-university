
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

        if (followers > 50):

            text = re.sub(r'[^\w\s]','',text)
            text = re.sub(" \d+", " ", text)
            text = re.sub('@\S+', ' ', text)  # Remove mentions.
            text = re.sub('http\S+', ' ', text)  # Remove urls.
            text = re.sub('[^A-Za-z0-9]+', " ",text) #Remove all special characters

            if text not in self.u_texts and text.strip() != "":
                self.u_ids.append(user_id)
                self.u_names.append(user_screen_name)
                self.u_texts.append(text)
                self.u_cords.append(coords)
                self.u_followers.append(followers)
                self.s_reply_count.append(reply_count)
                self.s_retweet_count.append(retweet_count)
                self.s_fav_count.append(favorite_count)

                if(len(self.u_ids) > 1000):

                    try:

                       values =  []
                       for j in range(0,1000):
                           tup = (self.u_texts[j],self.u_cords[j],self.u_followers[j],self.u_names[j],self.u_ids[j],self.s_reply_count[j],self.s_retweet_count[j],self.s_fav_count[j], self.mfilename);
                           values.append(tup)

                       cur.executemany(
                          """INSERT INTO CategoryTweets (Text, Location, Followers, Screen_name, User_id, Reply_count, Retweet_count, Fav_count, Category)
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
                    self.count += 1000
                    print("Wrote 1000 in db")

                    if self.count >= 50000:
                        print("All recorded in %s"%(self.mfilename))
                        return False



    def on_error(self, status_code):
        if status_code == 420:
            return False


def main():


    file = r'twitter.csv'
    tw = pd.read_csv(file)
    auth1 = OAuthHandler(tw['api_key'][0].strip(), tw['api_sec'][0].strip())
    auth1.set_access_token(tw['acc_token'][0].strip(), tw['acc_sec'][0].strip())

    auth2 = OAuthHandler(tw['api_key'][1].strip(), tw['api_sec'][1].strip())
    auth2.set_access_token(tw['acc_token'][1].strip(), tw['acc_sec'][1].strip())

    auth3 = OAuthHandler(tw['api_key'][2].strip(), tw['api_sec'][2].strip())
    auth3.set_access_token(tw['acc_token'][2].strip(), tw['acc_sec'][2].strip())

    estream1 = Stream(auth1, mylistener("Entertainment"))
    estream1.filter(track=["Entertainment", "Hollywood", "Music", "Movies", "Album", "Song", "Celebs"], async=True)

    estream2 = Stream(auth1, mylistener("Health"))
    estream2.filter(track=["Health", "Fitness", "Diet"], async=True)

    estream3 = Stream(auth2, mylistener("Politics"))
    estream3.filter(track=["Politics", "Government"], async=True)

    estream4 = Stream(auth2, mylistener("Sports"))
    estream4.filter(track=["Sports", "NBA", "Football", "Tennis","MMA", "Boxing"], async=True)

    estream5 = Stream(auth3, mylistener("Technology"))
    estream5.filter(track=["Technology", "Tech", "Mobile", "Science", "Tech", "Android", "Apple" ], async=True)

    estream6 = Stream(auth3, mylistener("Food"))
    estream6.filter(track=["Food"], async=True)



if __name__ == '__main__':
    main()
