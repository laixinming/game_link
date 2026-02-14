from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# 私链存储文件（Vercel 可正常读写）
CHAIN_FILE = "/tmp/chain.json"

# 初始化链
def init_chain():
    if not os.path.exists(CHAIN_FILE):
        with open(CHAIN_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f)

# 快照：只保留【玩家最终道具】，链永远极小
def make_snapshot(state):
    snapshot = {}
    for addr, items in state.items():
        snapshot[addr] = list(items)
    return snapshot

# 读取全服私链
@app.route("/get-chain", methods=["GET"])
def get_chain():
    init_chain()
    try:
        with open(CHAIN_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data), 200
    except:
        return jsonify({}), 200

# 更新全服私链（打怪、交易都会走这里）
@app.route("/update-chain", methods=["POST"])
def update_chain():
    init_chain()
    data = request.get_json()
    new_state = data.get("state", {})

    # 自动快照压缩
    snap = make_snapshot(new_state)

    with open(CHAIN_FILE, "w", encoding="utf-8") as f:
        json.dump(snap, f)

    return jsonify({"ok": True}), 200

if __name__ == "__main__":
    app.run(debug=True)
