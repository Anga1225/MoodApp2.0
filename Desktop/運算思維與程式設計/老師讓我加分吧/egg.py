class Egg:
    def __init__(self, name, days_left, creature_name, effect_type):
        self.name = name
        self.days_left = days_left
        self.creature_name = creature_name
        self.effect_type = effect_type
        self.hatched = False

    def tick(self):
        if self.days_left > 0:
            self.days_left -= 1
        if self.days_left == 0:
            self.hatched = True
            return True
        return False

    def get_status(self):
        if self.hatched:
            return f"{self.creature_name}（已孵化）｜效果：{self.effect_type}"
        else:
            return f"{self.name}（距離孵化還有 {self.days_left} 天）"
