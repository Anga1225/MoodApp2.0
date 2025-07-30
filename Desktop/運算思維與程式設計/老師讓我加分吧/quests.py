import json
import random
import os

DATA_PATH = os.path.join("data", "all_quests.json")

class Quest:
    def __init__(self, qid, name, success_rate, reward, type="一般", flavor_text="", fatigue_cost=1):
        self.id = qid
        self.name = name
        self.success_rate = success_rate
        self.reward = reward
        self.type = type
        self.flavor_text = flavor_text
        self.fatigue_cost = fatigue_cost

    def get_summary(self):
        return f"[{self.id}] {self.name} ｜{self.type}｜成功率：{self.success_rate}% ｜報酬：{self.reward} G"

    def attempt(self):
        return random.randint(1, 100) <= self.success_rate


def load_all_quests():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        return [Quest(**q) for q in data]


def get_daily_quests(n=3):
    all_quests = load_all_quests()
    return random.sample(all_quests, n)