import random

class Adventurer:
    def __init__(self, name, title, past, level=1, fatigue=0, skill=None):
        self.name = name
        self.title = title
        self.past = past
        self.level = level
        self.fatigue = fatigue
        self.skill = skill or self.assign_random_skill()

    def gain_exp(self):
        self.level += 1

    def rest(self):
        self.fatigue = max(0, self.fatigue - 1)

    def is_available(self):
        return self.fatigue < 3

    def get_status(self):
        return f"{self.name}（職稱：{self.title}｜疲勞：{self.fatigue}｜Lv.{self.level}｜技能：{self.skill}）"

    def assign_random_skill(self):
        return random.choice([
            "課業精通",      # 課業任務成功率 +15%
            "偷懶大師",      # 疲勞永遠不會上升
            "貪財鬼",        # 任務獎勵 +50
            "社交邊緣人",    # 無法接社交任務
            "無",           # 無技能
        ])

    def has_skill(self, skill_name):
        return self.skill == skill_name


def generate_adventurers():
    pool = [
        ("哈利", "晚睡資工大二生", "常在凌晨寫 code"),
        ("妙麗", "簡報召喚師", "PPT 永遠前一晚完成"),
        ("容恩", "除錯法師", "常用 print debug 的人"),
        ("石內普", "報告劍士", "一堆報告要交的倒楣鬼"),
        ("阿喵", "提問術士", "每次助教問有沒有人要問問題他都問")
    ]
    return [Adventurer(name, title, past) for name, title, past in random.sample(pool, 3)]


extra_adventurer_pool = [
    ("阿賴", "死靈師", "永遠卡在奇怪的 bug"),
    ("Luna", "AI 精靈", "ChatGPT 的化生"),
    ("泰德", "腦洞工程師", "總在想跟題目無關的優化"),
    ("商學喵", "商學守門神", "可愛爆擊路人")
]
