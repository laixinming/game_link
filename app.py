from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# Vercel 唯一可写目录
CHAIN_PATH = "/tmp/chain.json"

# 安全初始化链
def safe_load_chain():
    if not os.path.exists(CHAIN_PATH):
        default = {}
        with open(CHAIN_PATH, "w", encoding="utf-8") as f:
            json.dump(default, f)
        return default

    try:
        with open(CHAIN_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}

# 保存
def safe_save(data):
    with open(CHAIN_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f)

# 拉取全服状态
@app.route("/get-chain", methods=["GET"])
def get_chain():
    data = safe_load_chain()
    return jsonify(data), 200

# 更新全服状态（打怪、交易）
@app.route("/update-chain", methods=["POST"])
def update_chain():
    try:
        body = request.get_json()
        state = body.get("state", {})
        safe_save(state)
        return jsonify({"ok": True}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
