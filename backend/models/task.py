from mongo_engine import db

class Task(db.Document):
    task_id = db.StringField(required=True, unique=True)
    campaign_id = db.StringField(required=True)
    platform = db.StringField(required=True) # Instagram, Twitter
    # Instagram
    media_type = db.StringField()
    media_url = db.StringField()
    caption = db.StringField()
    # Twitter
    tweet = db.BooleanField(default=False) #
    tweet_text = db.StringField()
    tweet_media_url = db.StringField()
    retweet = db.BooleanField(default=False) #
    retweet_url = db.StringField()
    quote_tweet = db.BooleanField(default=False) #
    quote_tweet_url = db.StringField()

    @classmethod
    def add_task(cls, args):
        try:
            task = cls(**args)
            task.save()
            return {'error': False, 'data': task}
        except Exception as e:
            return {'error': True, 'data': str(e)}
        
    @classmethod
    def get_task_by_id(cls, task_id):
        try:
            task = cls.objects(task_id=task_id).first()
            return {'error': False, 'data': task}
        except Exception as e:
            return {'error': True, 'data': str(e)}
        
    @classmethod
    def get_task_by_campaign(cls, campaign_id):
        try:
            tasks = cls.objects(campaign_id=campaign_id)
            return {'error': False, 'data': tasks}
        except Exception as e:
            return {'error': True, 'data': str(e)}

