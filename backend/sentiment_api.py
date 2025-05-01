from flask import Flask, request, jsonify
from flask_cors import CORS
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

analyzer = SentimentIntensityAnalyzer()

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Sentiment Analysis API is running!"})

@app.route("/analyze", methods=["POST"])
def analyze_sentiment():
    data = request.json
    if "text" not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data["text"]
    sentiment_score = analyzer.polarity_scores(text)
    
    return jsonify(sentiment_score)

if __name__ == "__main__":
    app.run(port=5001, debug=True)
