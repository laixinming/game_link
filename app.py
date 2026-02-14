from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)
CHAIN_FILE = "/tmp/chain.json"

def get_chain_data():
    if os.path.exists(CHAIN_FILE):
        try:
            with open(CHAIN_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            return {}
    return {}

@app.route("/get-chain", methods=["GET"])
def get_chain():
    return jsonify(get_chain_data()), 200

@app.route("/update-chain", methods=["POST"])
def update_chain():
    try:
        data = request.get_json() or {}
        state = data.get("state", {})
        with open(CHAIN_FILE, "w", encoding="utf-8") as f:
            json.dump(state, f)
        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"ok": False, "err": str(e)}), 500
