from flask_restful import Resource, request, reqparse
import json
import base64
import cloudinary.uploader

class Cloudinary(Resource):
    def post(self):
        image = request.files['image']

        cloudinary.config(cloud_name ="dcwwcwkvu", api_key="363672271215785", api_secret="Oba71bEe-7fmwIgjugIe3qDZsDY")
        upload_result = cloudinary.uploader.upload(image)
        image_url = upload_result['secure_url']

        return {"error": False, "data": image_url}
