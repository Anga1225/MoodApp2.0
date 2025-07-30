import random
import time
from quests import get_daily_quests
from adventurer import generate_adventurers, Adventurer, extra_adventurer_pool
from egg import Egg

# ==== 常數設定 ====
MAX_ADVENTURERS = 6

# ==== 初始狀態 ====
day = 1
gold = 1000
player_name = "你"
GPT_points = 1
adventurers = generate_adventurers()
egg_inventory = [
    Egg("微熱的 Debug 蛋", 3, "錯誤吞噬獸", "疲勞 -1")
]

# ==== 顯示狀態 ====
def show_status():
    print(f"\n Day {day} - 校納界公會紀錄")
    print(f"金幣：{gold} G ｜ GPT 點數：{GPT_points}")
    print("組員狀態：")
    for adv in adventurers:
        print("-", adv.get_status())
    print("\n蛋的狀態：")
    for egg in egg_inventory:
        print("-", egg.get_status())

# ==== 顯示任務 ====
def show_quests(quests):
    print("\n今日任務清單：")
    for q in quests:
        print(q.get_summary())

# ==== 任務執行流程 ====
def assign_quest(quests):
    quest_id = input("\n請輸入任務編號：").strip().upper()
    quest = next((q for q in quests if q.id == quest_id), None)
    if not quest:
        print("找不到這個任務。請重新選擇。")
        return None

    print("可派遣成員：")
    available = [a for a in adventurers if a.is_available()]
    if not available:
        print("所有人都太累了！先讓大家休息吧。")
        return None

    for idx, a in enumerate(available):
        print(f"[{idx}] {a.name}")
    try:
        sel = int(input("選擇要派遣的編號：").strip())
        if sel < 0 or sel >= len(available):
            print("輸入錯誤，請輸入有效的成員編號。")
            return None
        adv = available[sel]
    except ValueError:
        print("請輸入數字。")
        return None

    print(f"\n{adv.name} 正在執行任務：{quest.name}...")
    time.sleep(1)

    modified_success = quest.success_rate
    bonus_reward = 0

    if adv.has_skill("課業精通") and quest.type == "課業":
        print("技能發動：課業精通 → 成功率提升 15%")
        modified_success += 15

    if adv.has_skill("貪財鬼"):
        print("技能發動：貪財鬼 → 任務報酬 +50")
        bonus_reward += 50

    if adv.has_skill("社交邊緣人") and quest.type == "社交":
        print("這位冒險者無法執行社交任務！請選別人")
        return None

    final_success = min(100, modified_success)
    if random.randint(1, 100) <= final_success:
        print(f"任務成功！獲得 {quest.reward + bonus_reward} G，{adv.name} 等級 +1")
        print(f"吐槽：「{quest.flavor_text}」")
        adv.gain_exp()
        if not adv.has_skill("偷懶大師"):
            adv.fatigue += quest.fatigue_cost
        return quest.reward + bonus_reward
    else:
        print("任務失敗。")
        print(f"吐槽：「{quest.flavor_text}（好像失敗了）」")
        if not adv.has_skill("偷懶大師"):
            adv.fatigue += quest.fatigue_cost
        return 0

# ==== 主遊戲迴圈 ====
def main():
    global day, gold
    print("="*40)
    print("《轉生 Debug 公會：異世界期中週》")
    print("你原本是個熬夜爆肝的資工系大學生")
    print("在一次 Debug 時過勞死，醒來發現自己重生在...")
    time.sleep(1)
    print("大學畜人生──一個分組靠賽、作業靠緣份、報告靠一人扛起的魔法世界。")
    time.sleep(1.5)

    print("\n你現在的身份是：學生公會代理會長")
    print("每天你需要派遣冒險者（同學）完成任務以撐過期中週。")
    print("每位組員有疲勞值，不能連續壓榨他們（雖然很想）")
    print("成功完成任務可以獲得金幣，失敗會累又沒錢。")

    print("\n特別提醒：")
    print("1. 每天可以派任務或選擇全員休息")
    print("2. 若成員疲勞太高將無法執行任務")
    print("3. 每個任務完成後會有吐槽語錄，請多留意")
    print("4. 有些蛋會孵出魔獸，帶來每日被動效果\n")
    print("="*40)

    while True:
        print(f"\nDay {day} 開始")
        daily_quests = get_daily_quests()
        show_quests(daily_quests)

        while True:
            print("\n請選擇行動：")
            print("[1] 派遣任務  [2] 全員休息  [3] 狀態查看  [4] 離開  [5] 招募新冒險者")
            cmd = input("> ").strip()

            if cmd == "1":
                earned = assign_quest(daily_quests)
                if earned is not None:
                    gold += earned
                    break

            elif cmd == "2":
                for a in adventurers:
                    a.rest()
                print("所有人都休息了一天。疲勞 -1")
                break

            elif cmd == "3":
                show_status()

            elif cmd == "4":
                print("感謝遊玩，再見！")
                return

            elif cmd == "5":
                if gold < 300:
                    print("金幣不足，無法招募新冒險者（需要 300 G）")
                    continue
                if len(adventurers) >= MAX_ADVENTURERS:
                    print("人力已滿，無法再招募更多人。")
                    continue
                new_adv_data = random.choice(extra_adventurer_pool)
                new_adv = Adventurer(*new_adv_data)
                adventurers.append(new_adv)
                gold -= 300
                print(f"已成功招募 {new_adv.name}！當前金幣：{gold} G")

            else:
                print("指令錯誤，請重新輸入。")

        # ==== 每日結算：孵蛋檢查與魔獸效果 ====
        for egg in egg_inventory:
            if egg.tick():
                print()
                print(f"孵化成功！{egg.creature_name} 出生了，效果：{egg.effect_type}")

        for egg in egg_inventory:
            if egg.hatched and egg.effect_type == "疲勞 -1":
                for a in adventurers:
                    a.rest()
                print("魔獸效果發動：所有成員疲勞 -1")

        day += 1

if __name__ == '__main__':
    main()
