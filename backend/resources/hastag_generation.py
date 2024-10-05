from flask_restful import Resource, request
from constants.gemini import generate_gemini_response
from io import BytesIO
import json

class Hashtags(Resource):
    def post(self):
        image = request.files['image']
        text = request.form['text']

        input = """
            Act as an expert of Social media and provide some hashtags that would be good for the provided image.
        """

        question = """
            What are some hashtags that would be good for this image?
            user_text: {text}

            output should be strictly in the json format as below.
            [
                "hashtag1",
                "hashtag2",
                "hashtag3",
                "hashtag4",
                "hashtag5"
            ]
            Strictly no \n or \ or any other special characters are allowed. don't format your response in any other way.
        """

        image_content = BytesIO(image.read())
        question = question.format(text=text)
        response = generate_gemini_response(input_prompt=input, image=image_content, question_prompt=question)
        print(response)

        return {"error": False, "data": json.loads(response)}
    

class Caption(Resource):
    def post(self):
        image = request.files['image']

        input = """
            Act as an expert of Social media and provide a caption for the provided image.
            The caption should be promotional and should be able to attract the audience.
        """

        question = """
            What is a good caption for this image?
            output should be just the text. Caption should sound like poetry/trending.
            output format: 
            {
                "caption": "Your caption here"
                "song_name": "latest trening song matching the image"
            }
            Strictly no \n or \ or any other special characters are allowed. don't format your response in any way.
        """

        image_content = BytesIO(image.read())
        response = generate_gemini_response(input_prompt=input, image=image_content, question_prompt=question)
        print(response)

        return {"error": False, "data": json.loads(response)}