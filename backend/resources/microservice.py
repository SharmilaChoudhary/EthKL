from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/fetch-oembed', methods=['GET'])
def fetch_oembed():
    # Get the URL from query parameters
    tweet_url = request.args.get('url')
    
    if not tweet_url:
        return jsonify({"error": "URL parameter is missing"}), 400

    # Construct the oEmbed URL
    oembed_url = f"https://publish.twitter.com/oembed?url={tweet_url}"

    try:
        # Make the GET request
        response = requests.get(oembed_url)

        # Check if the request was successful
        if response.status_code == 200:
            # Return the JSON response
            return jsonify(response.json())
        else:
            # Return an error message if the request was not successful
            return jsonify({"error": f"Request returned an error: {response.status_code} {response.text}"}), response.status_code
    except Exception as e:
        # Return a general error message if an exception occurs
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)