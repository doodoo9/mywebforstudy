import asyncio
from flask import Flask, request, Response
from flask_cors import CORS
import edge_tts

app = Flask(__name__)
CORS(app)

@app.route('/tts', methods=['POST'])
def tts():
    print(f"Received request: {request.json}")
    data = request.json
    text = data.get('text')
    voice = data.get('voice', 'en-US-AriaNeural')
    
    if not text:
        return "Text is required", 400

    async def get_audio():
        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        return audio_data

    try:
        # Run the async TTS generation in a synchronous wrapper
        audio = asyncio.run(get_audio())
        return Response(audio, mimetype='audio/mpeg')
    except Exception as e:
        print(f"Error: {e}")
        return str(e), 500

if __name__ == '__main__':
    from waitress import serve
    print("Starting production TTS server on port 5000...")
    serve(app, host='0.0.0.0', port=5000)
