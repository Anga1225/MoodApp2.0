import random
from enum import Enum
from collections import Counter
from typing import List, Tuple, Optional

class SidePot:
    """邊底池類"""

    def __init__(self, amount: int, eligible_players):
        self.amount = amount
        self.eligible_players = eligible_players

    def __str__(self):
        player_names = [p.name for p in self.eligible_players]
        return f"底池 {self.amount} 籌碼 (參與者: {', '.join(player_names)})"


class Suit(Enum):
    HEARTS = "♥"
    DIAMONDS = "♦"
    CLUBS = "♣"
    SPADES = "♠"


class Rank(Enum):
    TWO = (2, "2")
    THREE = (3, "3")
    FOUR = (4, "4")
    FIVE = (5, "5")
    SIX = (6, "6")
    SEVEN = (7, "7")
    EIGHT = (8, "8")
    NINE = (9, "9")
    TEN = (10, "10")
    JACK = (11, "J")
    QUEEN = (12, "Q")
    KING = (13, "K")
    ACE = (14, "A")

    def __init__(self, numeric_value, display):
        self.numeric_value = numeric_value
        self.display = display


class HandRank(Enum):
    HIGH_CARD = (1, "高牌")
    PAIR = (2, "一對")
    TWO_PAIR = (3, "兩對")
    THREE_KIND = (4, "三條")
    STRAIGHT = (5, "順子")
    FLUSH = (6, "同花")
    FULL_HOUSE = (7, "葫蘆")
    FOUR_KIND = (8, "四條")
    STRAIGHT_FLUSH = (9, "同花順")
    ROYAL_FLUSH = (10, "皇家同花順")

    def __init__(self, numeric_value, display):
        self.numeric_value = numeric_value
        self.display = display


class Card:
    def __init__(self, suit: Suit, rank: Rank):
        self.suit = suit
        self.rank = rank

    def __str__(self):
        return f"{self.rank.display}{self.suit.value}"

    def __repr__(self):
        return self.__str__()


class Deck:
    def __init__(self):
        self.cards = []
        self.reset()

    def reset(self):
        """重置牌組"""
        self.cards = [Card(suit, rank) for suit in Suit for rank in Rank]
        self.shuffle()

    def shuffle(self):
        """洗牌"""
        random.shuffle(self.cards)

    def deal_card(self) -> Optional[Card]:
        """發一張牌"""
        return self.cards.pop() if self.cards else None

    def cards_left(self) -> int:
        """剩餘牌數"""
        return len(self.cards)


class Hand:
    def __init__(self, cards: List[Card] = None):
        self.cards = cards or []

    def add_card(self, card: Card):
        """加入一張牌"""
        self.cards.append(card)

    def clear(self):
        """清空手牌"""
        self.cards.clear()

    def __str__(self):
        return " ".join(str(card) for card in self.cards)

    def evaluate(self) -> Tuple[HandRank, List[int]]:
        """評估手牌強度"""
        if len(self.cards) < 5:
            return HandRank.HIGH_CARD, []

        # 取出所有可能的5張牌組合進行評估
        from itertools import combinations
        best_rank = HandRank.HIGH_CARD
        best_values = []

        for combo in combinations(self.cards, 5):
            rank, values = self._evaluate_five_cards(list(combo))
            if rank.numeric_value > best_rank.numeric_value or (
                    rank.numeric_value == best_rank.numeric_value and values > best_values):
                best_rank = rank
                best_values = values

        return best_rank, best_values

    def _evaluate_five_cards(self, cards: List[Card]) -> Tuple[HandRank, List[int]]:
        """評估5張牌的強度"""
        ranks = [card.rank.numeric_value for card in cards]
        suits = [card.suit for card in cards]
        rank_counts = Counter(ranks)
        ranks.sort(reverse=True)

        is_flush = len(set(suits)) == 1
        is_straight = self._is_straight(ranks)

        # 特殊處理A-2-3-4-5順子
        is_wheel_straight = False
        if ranks == [14, 5, 4, 3, 2]:
            is_straight = True
            is_wheel_straight = True
            ranks = [5, 4, 3, 2, 1]  # A當作1
            # 同步更新rank_counts，將A(14)改為1
            rank_counts = Counter([5, 4, 3, 2, 1])

        counts = sorted(rank_counts.values(), reverse=True)
        unique_ranks = sorted(rank_counts.keys(), key=lambda x: (rank_counts[x], x), reverse=True)

        if is_straight and is_flush:
            if not is_wheel_straight and ranks[0] == 14 and ranks[1] == 13:  # A-K-Q-J-10
                return HandRank.ROYAL_FLUSH, [ranks[0]]
            return HandRank.STRAIGHT_FLUSH, [ranks[0]]

        if counts[0] == 4:
            return HandRank.FOUR_KIND, unique_ranks

        if counts[0] == 3 and counts[1] == 2:
            return HandRank.FULL_HOUSE, unique_ranks

        if is_flush:
            return HandRank.FLUSH, ranks

        if is_straight:
            return HandRank.STRAIGHT, [ranks[0]]

        if counts[0] == 3:
            return HandRank.THREE_KIND, unique_ranks

        if counts[0] == 2 and counts[1] == 2:
            return HandRank.TWO_PAIR, unique_ranks

        if counts[0] == 2:
            return HandRank.PAIR, unique_ranks

        return HandRank.HIGH_CARD, ranks

    def _is_straight(self, ranks: List[int]) -> bool:
        """檢查是否為順子"""
        sorted_ranks = sorted(set(ranks))
        if len(sorted_ranks) != 5:
            return False
        return sorted_ranks[-1] - sorted_ranks[0] == 4


class Player:
    def __init__(self, name: str, chips: int = 1000):
        self.name = name
        self.chips = chips
        self.hand = Hand()
        self.current_bet = 0
        self.folded = False
        self.all_in = False

    def receive_card(self, card: Card):
        """接收一張牌"""
        self.hand.add_card(card)

    def bet(self, amount: int) -> int:
        """下注"""
        bet_amount = min(amount, self.chips)
        self.chips -= bet_amount
        self.current_bet += bet_amount
        if self.chips == 0:
            self.all_in = True
            print(f"  💰 {self.name} All-in！剩餘籌碼全部投入")
        return bet_amount

    def fold(self):
        """棄牌"""
        self.folded = True

    def reset_for_new_hand(self):
        """為新局重置"""
        self.hand.clear()
        self.current_bet = 0
        self.folded = False
        self.all_in = False

    def can_act(self) -> bool:
        """是否可以行動"""
        return not self.folded and not self.all_in and self.chips > 0

    def __str__(self):
        return f"{self.name}: {self.chips}籌碼, 當前下注: {self.current_bet}"


class PokerGame:
    def __init__(self, player_names: List[str]):
        self.players = [Player(name) for name in player_names]
        self.deck = Deck()
        self.community_cards = []
        self.side_pots = []  # 邊底池列表
        self.current_bet = 0
        self.dealer_position = 0
        self.small_blind = 10
        self.big_blind = 20
        self.game_over = False

    def start_new_hand(self):
        """開始新的一局"""
        print(f"\n{'=' * 50}")
        print("新的一局開始！")
        print(f"{'=' * 50}")

        # 顯示莊家信息
        dealer = self.players[self.dealer_position]
        print(f"🎯 莊家: {dealer.name}")

        # 重置所有玩家和遊戲狀態
        for player in self.players:
            player.reset_for_new_hand()

        self.deck.reset()
        self.community_cards.clear()
        self.side_pots.clear()  # 清空邊底池
        self.current_bet = 0

        # 檢查是否有玩家沒有籌碼
        active_players = [p for p in self.players if p.chips > 0]
        if len(active_players) < 2:
            print("遊戲結束！只剩一個玩家有籌碼。")
            self.game_over = True
            return

        # 顯示盲注位置
        if len(active_players) >= 2:
            if len(active_players) == 2:
                # 兩人遊戲的特殊說明
                dealer_player = self.players[self.dealer_position]
                other_player = None
                for player in active_players:
                    if player != dealer_player:
                        other_player = player
                        break

                if dealer_player and other_player:
                    print(f"👑 小盲注: {dealer_player.name} (Button)")
                    print(f"🏛️  大盲注: {other_player.name}")
                    print("💡 兩人遊戲規則:")
                    print("   - 翻牌前：Button(小盲注)先行動")
                    print("   - 翻牌後：大盲注先行動，Button後行動")
            else:
                # 多人遊戲
                sb_player = None
                bb_player = None

                for i in range(len(self.players)):
                    pos = (self.dealer_position + 1 + i) % len(self.players)
                    if self.players[pos].chips > 0:
                        if sb_player is None:
                            sb_player = self.players[pos]
                        elif bb_player is None:
                            bb_player = self.players[pos]
                            break

                if sb_player and bb_player:
                    print(f"👑 小盲注: {sb_player.name}")
                    print(f"🏛️  大盲注: {bb_player.name}")

        # 發底牌
        for _ in range(2):
            for player in active_players:
                card = self.deck.deal_card()
                if card:
                    player.receive_card(card)

        # 顯示玩家手牌（每個玩家只能看到自己的牌）
        print("\n=== 底牌發放完成 ===")
        print("現在每位玩家輪流查看自己的手牌...")
        print("⚠️ 重要：請確保只有當前玩家能看到螢幕！")

        for i, player in enumerate(active_players):
            if not player.folded:
                print(f"\n{'=' * 50}")
                print(f"           輪到 {player.name} 查看手牌")
                print(f"{'=' * 50}")
                print(f"👆 {player.name}，請按 Enter 查看你的手牌...")
                print("👀 其他玩家請暫時避開螢幕")

                # 清空輸入緩衝區並等待用戶輸入
                import sys
                if hasattr(sys.stdin, 'flush'):
                    sys.stdin.flush()

                try:
                    user_input = input("按 Enter 繼續...").strip()
                    print(f"\n🎴 {player.name} 的手牌: {player.hand}")
                    print("\n🔒 請記住你的牌，其他玩家請勿偷看！")
                    print("📝 建議：可以在紙上記錄你的手牌")

                    # 再次等待確認
                    input(f"\n{player.name} 查看完畢後，請按 Enter 讓下一位玩家查看...")

                except (EOFError, KeyboardInterrupt):
                    print(f"\n🎴 {player.name} 的手牌: {player.hand}")
                    print("（自動顯示手牌）")

                # 清空螢幕
                print("\n" * 25)
                if i < len(active_players) - 1:  # 不是最後一個玩家
                    print("螢幕已清空，下一位玩家可以查看...")

        print(f"\n{'=' * 50}")
        print("所有玩家都已查看完手牌，遊戲繼續！")
        print(f"{'=' * 50}")

        # 下盲注
        self._post_blinds()

        # 翻牌前下注輪
        print("\n=== 翻牌前下注 ===")
        self._betting_round()
        self._finalize_side_pots()  # 整理邊底池

        # 檢查是否所有玩家都All-in
        if self._all_players_all_in():
            print("\n🎰 所有玩家都已All-in，直接進行攤牌！")
            self._deal_remaining_cards()
            self._showdown()
            return

        if self._count_active_players() > 1:
            # 翻牌
            self._deal_flop()
            print(f"\n=== 翻牌 ===")
            print(f"公共牌: {' '.join(str(card) for card in self.community_cards)}")
            self._betting_round()
            self._finalize_side_pots()  # 整理邊底池

            # 再次檢查All-in狀態
            if self._all_players_all_in():
                print("\n🎰 所有玩家都已All-in，直接發完剩餘公共牌！")
                self._deal_remaining_cards()
                self._showdown()
                return

        if self._count_active_players() > 1:
            # 轉牌
            self._deal_turn()
            print(f"\n=== 轉牌 ===")
            print(f"公共牌: {' '.join(str(card) for card in self.community_cards)}")
            self._betting_round()
            self._finalize_side_pots()  # 整理邊底池

            # 再次檢查All-in狀態
            if self._all_players_all_in():
                print("\n🎰 所有玩家都已All-in，直接發完剩餘公共牌！")
                self._deal_remaining_cards()
                self._showdown()
                return

        if self._count_active_players() > 1:
            # 河牌
            self._deal_river()
            print(f"\n=== 河牌 ===")
            print(f"公共牌: {' '.join(str(card) for card in self.community_cards)}")
            self._betting_round()
            self._finalize_side_pots()  # 整理邊底池

        # 攤牌
        self._showdown()

        # 移動莊家位置
        self.dealer_position = (self.dealer_position + 1) % len(self.players)
        print(f"\n下一局莊家將是: {self.players[self.dealer_position].name}")

    def _post_blinds(self):
        """下盲注"""
        active_players = [p for p in self.players if p.chips > 0]
        if len(active_players) < 2:
            return

        # 兩人遊戲的特殊規則
        if len(active_players) == 2:
            # 兩人遊戲：莊家是小盲注，另一位是大盲注
            dealer_player = self.players[self.dealer_position]
            other_player = None

            for player in active_players:
                if player != dealer_player:
                    other_player = player
                    break

            if dealer_player.chips > 0 and other_player.chips > 0:
                # 小盲注
                sb_amount = dealer_player.bet(self.small_blind)
                self._add_to_pot(sb_amount, [dealer_player])
                print(f"{dealer_player.name} (莊家/小盲注) 下注 {sb_amount}")

                # 另一位玩家（大盲注）
                bb_amount = other_player.bet(self.big_blind)
                self._add_to_pot(bb_amount, [other_player])
                self.current_bet = other_player.current_bet
                print(f"{other_player.name} (大盲注) 下注 {bb_amount}")
        else:
            # 多人遊戲的標準規則
            sb_pos = (self.dealer_position + 1) % len(self.players)
            bb_pos = (self.dealer_position + 2) % len(self.players)

            # 找到實際的小盲注和大盲注玩家
            sb_player = None
            bb_player = None

            for i in range(len(self.players)):
                pos = (self.dealer_position + 1 + i) % len(self.players)
                if self.players[pos].chips > 0:
                    if sb_player is None:
                        sb_player = self.players[pos]
                    elif bb_player is None:
                        bb_player = self.players[pos]
                        break

            if sb_player and bb_player:
                # 小盲注
                sb_amount = sb_player.bet(self.small_blind)
                self._add_to_pot(sb_amount, [sb_player])
                print(f"{sb_player.name} 下小盲注 {sb_amount}")

                # 大盲注
                bb_amount = bb_player.bet(self.big_blind)
                self._add_to_pot(bb_amount, [bb_player])
                self.current_bet = bb_player.current_bet
                print(f"{bb_player.name} 下大盲注 {bb_amount}")

    def _betting_round(self):
        """一輪下注"""
        active_players = [p for p in self.players if not p.folded and p.chips > 0]
        if len(active_players) <= 1:
            return

        # 確定行動順序
        if len(active_players) == 2:
            # 兩人遊戲的行動順序
            dealer_player = self.players[self.dealer_position]
            other_player = None
            for player in active_players:
                if player != dealer_player:
                    other_player = player
                    break

            if self.current_bet > 0:  # 翻牌前（有盲注）
                # 翻牌前：小盲注（Button/莊家）先行動
                if dealer_player in active_players and other_player in active_players:
                    players_order = [dealer_player, other_player]
                else:
                    players_order = active_players[:]
            else:  # 翻牌、轉牌、河牌
                # 翻牌後：大盲注（非莊家）先行動
                if dealer_player in active_players and other_player in active_players:
                    players_order = [other_player, dealer_player]
                else:
                    players_order = active_players[:]
        else:
            # 多人遊戲的行動順序
            if self.current_bet == 0:  # 翻牌、轉牌、河牌後的下注輪
                # 從小盲注開始（如果還在遊戲中）
                start_pos = (self.dealer_position + 1) % len(self.players)
            else:  # 翻牌前下注輪（有大盲注）
                # 從大盲注左邊的玩家開始
                start_pos = (self.dealer_position + 3) % len(self.players)

            # 建立行動順序列表
            players_order = []
            for i in range(len(self.players)):
                pos = (start_pos + i) % len(self.players)
                player = self.players[pos]
                if not player.folded and player.chips > 0:
                    players_order.append(player)

        players_to_act = players_order[:]
        last_raiser = None
        rounds_without_action = 0

        while len(players_to_act) > 0 and rounds_without_action < len(active_players):
            current_player = players_to_act.pop(0)

            if current_player.folded or current_player.all_in:
                continue

            # 顯示當前狀態
            print(f"\n{'=' * 40}")
            print(f"輪到 {current_player.name}")
            if len(active_players) == 2:
                # 兩人遊戲顯示位置信息
                dealer_player = self.players[self.dealer_position]
                if current_player == dealer_player:
                    if self.current_bet > 0:
                        print("(小盲注/Button - 翻牌前先行動)")
                    else:
                        print("(Button - 翻牌後後行動)")
                else:
                    if self.current_bet > 0:
                        print("(大盲注 - 翻牌前後行動)")
                    else:
                        print("(大盲注 - 翻牌後先行動)")
            print(f"{'=' * 40}")
            print(f"你的手牌: {current_player.hand}")
            if self.community_cards:
                print(f"公共牌: {' '.join(str(card) for card in self.community_cards)}")
            print(f"你的籌碼: {current_player.chips}")
            print(f"你已下注: {current_player.current_bet}")
            print(f"需要跟注: {max(0, self.current_bet - current_player.current_bet)}")
            print(f"當前底池: {self._get_total_pot()}")
            print(f"當前最高下注: {self.current_bet}")

            # 檢查玩家是否需要跟注
            call_amount = max(0, self.current_bet - current_player.current_bet)

            # 獲取玩家動作
            action = self._get_player_action(current_player)

            if action == "fold":
                current_player.fold()
                print(f"{current_player.name} 棄牌")
                rounds_without_action = 0

            elif action == "call":
                if call_amount > 0:
                    actual_bet = current_player.bet(call_amount)
                    self._add_to_pot(actual_bet, [current_player])
                    print(f"{current_player.name} 跟注 {actual_bet}")
                else:
                    print(f"{current_player.name} 過牌")
                rounds_without_action += 1

            elif action.startswith("raise"):
                try:
                    raise_amount = int(action.split()[1])
                    total_needed = call_amount + raise_amount
                    actual_bet = current_player.bet(min(total_needed, current_player.chips))
                    self._add_to_pot(actual_bet, [current_player])

                    # 檢查是否為有效加注（必須達到完整的加注金額）
                    if current_player.current_bet > self.current_bet:
                        # 檢查是否為完整加注
                        intended_total = self.current_bet + raise_amount
                        if current_player.current_bet >= intended_total:
                            # 完整加注：設定新的最高下注
                            old_bet = self.current_bet
                            self.current_bet = current_player.current_bet
                            last_raiser = current_player
                            # 其他玩家需要重新行動
                            players_to_act = [p for p in active_players
                                              if p != current_player and not p.folded and not p.all_in]
                            rounds_without_action = 0
                            print(f"{current_player.name} 加注到 {current_player.current_bet}")
                        else:
                            # All-in但金額不足以構成完整加注
                            # 不改變最高下注，其他玩家只需跟注到原來的金額
                            rounds_without_action = 0
                            if current_player.all_in:
                                print(f"{current_player.name} All-in {actual_bet} 籌碼（不足以完成加注）")
                            else:
                                print(f"{current_player.name} 跟注 {actual_bet}")

                            # 其他還沒行動的玩家仍需跟注到原最高下注
                            remaining_players = [p for p in active_players
                                                 if p != current_player and not p.folded and not p.all_in
                                                 and p.current_bet < self.current_bet]
                            if remaining_players:
                                players_to_act = remaining_players
                    else:
                        # 只是跟注
                        print(f"{current_player.name} 跟注 {actual_bet}")
                        rounds_without_action += 1

                except (IndexError, ValueError):
                    print("無效的加注金額")
                    players_to_act.insert(0, current_player)  # 重新輪到這個玩家
                    rounds_without_action = 0

            # 檢查是否所有玩家都已行動且沒有新的加注
            active_players = [p for p in self.players if not p.folded]
            if len(active_players) <= 1:
                break

            # 檢查是否所有玩家都All-in
            if self._all_players_all_in():
                print("\n🎰 所有剩餘玩家都已All-in，結束下注輪")
                break

            # 如果這輪沒有人加注且所有人都已行動，結束這輪下注
            if rounds_without_action >= len([p for p in active_players if not p.all_in]):
                break

    def _get_player_action(self, player: Player) -> str:
        """獲取玩家動作"""
        call_amount = max(0, self.current_bet - player.current_bet)

        while True:
            if call_amount == 0:
                print("\n可用動作:")
                print("- check: 過牌")
                print("- bet [金額]: 下注 (例如: bet 50)")
                print("- fold: 棄牌")

                # 解釋當前情況
                if player.current_bet == self.current_bet and self.current_bet > 0:
                    print(f"\n💡 規則解釋: 你已下注 {player.current_bet} 籌碼，等於當前最高下注")
                    print("   - 你可以過牌(check)來免費看下一張牌")
                    print("   - 或者下注(bet)來向其他玩家施壓")
                elif self.current_bet == 0:
                    print(f"\n💡 規則解釋: 目前還沒有人下注")
                    print("   - 你可以過牌(check)讓下一位玩家行動")
                    print("   - 或者下注(bet)來開始這輪的下注")

                action = input("\n請輸入你的選擇 (或輸入 'help' 查看詳細說明): ").strip()

                # 清理輸入，移除可能的特殊字符
                action = action.replace(']', '').replace('[', '').replace(')', '').replace('(', '').lower()

                if action == "check":
                    return "call"
                elif action.startswith("bet"):
                    parts = action.split()
                    if len(parts) >= 2:
                        try:
                            bet_amount = int(parts[1])
                            if bet_amount > 0 and bet_amount <= player.chips:
                                return f"raise {bet_amount}"
                            elif bet_amount > player.chips:
                                print(f"❌ 下注金額不能超過你的籌碼 ({player.chips})")
                                continue
                            else:
                                print("❌ 下注金額必須大於0")
                                continue
                        except ValueError:
                            print("❌ 請輸入有效的數字")
                            continue
                    else:
                        print("❌ 請輸入下注金額，例如: bet 50")
                        continue
                elif action == "fold":
                    return "fold"
                elif action == "help":
                    self._show_action_help()
                    continue
                else:
                    print(f"❌ 無效的動作: '{action}'")
                    print("💡 請輸入 check、bet [金額]、fold 或 help")
                    continue

            else:
                print("\n可用動作:")
                print(f"- call: 跟注 {call_amount} 籌碼")
                print("- raise [金額]: 加注 (例如: raise 50)")
                print("- fold: 棄牌")

                # 解釋當前情況
                print(f"\n💡 規則解釋: 當前最高下注是 {self.current_bet} 籌碼")
                print(f"   - 你已下注 {player.current_bet} 籌碼，還需要 {call_amount} 籌碼才能跟上")
                print("   - 跟注(call): 補足差額，繼續參與遊戲")
                print("   - 加注(raise): 跟注後再額外增加下注金額")
                print(f"   - 棄牌(fold): 放棄已下注的 {player.current_bet} 籌碼，退出本局")

                action = input("\n請輸入你的選擇 (或輸入 'help' 查看詳細說明): ").strip()

                # 清理輸入
                action = action.replace(']', '').replace('[', '').replace(')', '').replace('(', '').lower()

                if action == "call":
                    return "call"
                elif action == "fold":
                    return "fold"
                elif action.startswith("raise"):
                    parts = action.split()
                    if len(parts) >= 2:
                        try:
                            raise_amount = int(parts[1])
                            total_needed = call_amount + raise_amount
                            if raise_amount > 0 and total_needed <= player.chips:
                                return f"raise {raise_amount}"
                            elif total_needed > player.chips:
                                print(f"❌ 總下注金額 ({total_needed}) 不能超過你的籌碼 ({player.chips})")
                                print(f"   需要跟注 {call_amount} + 加注 {raise_amount} = {total_needed}")
                                continue
                            else:
                                print("❌ 加注金額必須大於0")
                                continue
                        except ValueError:
                            print("❌ 請輸入有效的數字")
                            continue
                    else:
                        print("❌ 請輸入加注金額，例如: raise 50")
                        continue
                elif action == "help":
                    self._show_action_help()
                    continue
                else:
                    print(f"❌ 無效的動作: '{action}'")
                    print("💡 請輸入 call、raise [金額]、fold 或 help")
                    continue

    def _show_action_help(self):
        """顯示行動幫助說明"""
        print("\n" + "=" * 50)
        print("                德州撲克行動規則詳解")
        print("=" * 50)

        print("\n【基本行動說明】")
        print("Check (過牌):")
        print("  - 不下注但繼續留在遊戲中")
        print("  - 只有在沒有人加注時才能過牌")
        print("  - 如果所有人都過牌，直接進入下一輪")

        print("\nCall (跟注):")
        print("  - 跟上當前最高的下注金額")
        print("  - 必須投入足夠籌碼來匹配最高下注")
        print("  - 繼續參與這局遊戲")

        print("\nBet/Raise (下注/加注):")
        print("  - Bet: 在沒有人下注時主動下注")
        print("  - Raise: 在有人下注後加注更多金額")
        print("  - 其他玩家必須跟注或加注才能繼續")

        print("\nFold (棄牌):")
        print("  - 放棄這局遊戲")
        print("  - 失去已經下注的所有籌碼")
        print("  - 不能看到後續的公共牌")

        print("\n【All-in 規則】")
        print("自動觸發條件:")
        print("  - 當你的籌碼不足以完成想要的動作時")
        print("  - 系統會自動投入你的所有剩餘籌碼")

        print("\n完整加注 vs 不完整加注:")
        print("  - 完整加注: 你的All-in金額≥原下注+加注金額")
        print("    → 設定新的最高下注，其他人需跟注你的金額")
        print("  - 不完整加注: 你的All-in金額<原下注+加注金額")
        print("    → 不改變最高下注，其他人只需跟注到原金額")

        print("\nAll-in後的權利:")
        print("  - 繼續參與攤牌")
        print("  - 不能再進行任何下注動作")
        print("  - 如果贏了可以贏得相應的底池部分")

        print("\n【特殊情況說明】")
        print("大盲注特權:")
        print("  - 翻牌前如果沒有加注，大盲注可以過牌")
        print("  - 這是因為大盲注已經投入了強制下注")

        print("\n多人All-in:")
        print("  - 可能形成主底池和邊底池")
        print("  - 每個玩家只能贏得自己參與的底池部分")
        print("  - 當所有剩餘玩家都All-in時，直接發完公共牌進行攤牌")

        print("\n【下注輪結束條件】")
        print("1. 所有玩家都過牌 (無人下注的情況)")
        print("2. 所有玩家都跟注到相同金額")
        print("3. 只剩一個玩家未棄牌")
        print("4. 所有玩家都All-in")

        print("=" * 50)

    def _deal_flop(self):
        """發翻牌（3張公共牌）"""
        self.deck.deal_card()  # 燒牌
        for _ in range(3):
            card = self.deck.deal_card()
            if card:
                self.community_cards.append(card)
        self.current_bet = 0
        for player in self.players:
            player.current_bet = 0

    def _deal_turn(self):
        """發轉牌（第4張公共牌）"""
        self.deck.deal_card()  # 燒牌
        card = self.deck.deal_card()
        if card:
            self.community_cards.append(card)
        self.current_bet = 0
        for player in self.players:
            player.current_bet = 0

    def _deal_river(self):
        """發河牌（第5張公共牌）"""
        self.deck.deal_card()  # 燒牌
        card = self.deck.deal_card()
        if card:
            self.community_cards.append(card)
        self.current_bet = 0
        for player in self.players:
            player.current_bet = 0

    def _all_players_all_in(self) -> bool:
        """檢查是否所有剩餘玩家都All-in"""
        active_players = [p for p in self.players if not p.folded]
        if len(active_players) <= 1:
            return False

        # 至少要有一個玩家All-in，且其他玩家也都All-in
        players_with_chips = [p for p in active_players if p.chips > 0]
        all_in_players = [p for p in active_players if p.all_in]

        # 如果只剩一個有籌碼的玩家，其他都All-in，也算全部All-in
        return len(players_with_chips) <= 1 and len(all_in_players) >= 1

    def _deal_remaining_cards(self):
        """發完剩餘的公共牌"""
        while len(self.community_cards) < 5:
            if len(self.community_cards) == 0:
                # 發翻牌
                self._deal_flop()
                print(f"翻牌: {' '.join(str(card) for card in self.community_cards[-3:])}")
            elif len(self.community_cards) == 3:
                # 發轉牌
                self._deal_turn()
                print(f"轉牌: {self.community_cards[-1]}")
            elif len(self.community_cards) == 4:
                # 發河牌
                self._deal_river()
                print(f"河牌: {self.community_cards[-1]}")

        print(f"最終公共牌: {' '.join(str(card) for card in self.community_cards)}")

    def _add_to_pot(self, amount: int, contributing_players):
        """將籌碼加入適當的底池"""
        if not contributing_players:
            return

        # 找到所有當前可以參與的玩家（未棄牌且有籌碼參與過）
        active_players = [p for p in self.players if not p.folded]

        # 檢查是否需要創建邊底池
        if self.side_pots:
            # 已有邊底池，加入最後一個底池
            last_pot = self.side_pots[-1]
            # 檢查是否所有貢獻玩家都能參與這個底池
            if all(player in last_pot.eligible_players for player in contributing_players):
                last_pot.amount += amount
            else:
                # 需要創建新的邊底池
                eligible_players = [p for p in active_players if not p.all_in or p in contributing_players]
                new_pot = SidePot(amount, eligible_players)
                self.side_pots.append(new_pot)
        else:
            # 第一個底池
            eligible_players = active_players[:]
            new_pot = SidePot(amount, eligible_players)
            self.side_pots.append(new_pot)

    def _get_total_pot(self) -> int:
        """獲取總底池金額"""
        return sum(pot.amount for pot in self.side_pots)

    def _finalize_side_pots(self):
        """在下注輪結束時整理邊底池"""
        if not self.side_pots:
            return

        # 按玩家的總下注金額來重新組織底池
        active_players = [p for p in self.players if not p.folded]
        if len(active_players) <= 1:
            return

        # 獲取所有不同的下注水平
        bet_levels = sorted(set(p.current_bet for p in active_players))

        # 重新計算邊底池
        new_side_pots = []
        prev_level = 0

        for level in bet_levels:
            if level > prev_level:
                # 這一層的玩家
                eligible_players = [p for p in active_players if p.current_bet >= level]
                if eligible_players:
                    # 計算這一層的金額
                    amount_per_player = level - prev_level
                    total_amount = amount_per_player * len(eligible_players)

                    if total_amount > 0:
                        pot = SidePot(total_amount, eligible_players)
                        new_side_pots.append(pot)

                prev_level = level

        # 只有在有實際變化時才更新
        if new_side_pots:
            # 保持總金額不變
            old_total = self._get_total_pot()
            self.side_pots = new_side_pots
            new_total = self._get_total_pot()

            # 如果有差額，調整最後一個底池
            if old_total != new_total and self.side_pots:
                self.side_pots[-1].amount += (old_total - new_total)

    def _showdown(self):
        """攤牌決定勝負"""
        active_players = [p for p in self.players if not p.folded]

        if len(active_players) == 1:
            winner = active_players[0]
            total_pot = self._get_total_pot()
            winner.chips += total_pot
            print(f"\n{winner.name} 贏得 {total_pot} 籌碼！")
            return

        print(f"\n=== 攤牌 ===")
        print(f"公共牌: {' '.join(str(card) for card in self.community_cards)}")

        # 顯示邊底池信息
        if len(self.side_pots) > 1:
            print(f"\n💰 底池分配:")
            for i, pot in enumerate(self.side_pots):
                print(f"  {pot}")
        else:
            print(f"\n💰 總底池: {self._get_total_pot()} 籌碼")
        print()

        # 評估所有玩家的手牌
        player_hands = []
        for player in active_players:
            # 將手牌和公共牌結合
            all_cards = player.hand.cards + self.community_cards
            temp_hand = Hand(all_cards)
            rank, values = temp_hand.evaluate()

            # 找出實際使用的最佳5張牌
            best_five_cards = self._get_best_five_cards(all_cards, rank, values)

            player_hands.append((player, rank, values, best_five_cards))

            # 顯示詳細牌型分析
            print(f"🎴 {player.name}:")
            print(f"   底牌: {' '.join(str(card) for card in player.hand.cards)}")
            print(f"   最佳牌型: {rank.display}")
            print(f"   使用牌張: {' '.join(str(card) for card in best_five_cards)}")
            self._explain_hand_composition(rank, best_five_cards)
            print()

        # 為每個邊底池分配獎金
        for i, pot in enumerate(self.side_pots):
            print(f"🏆 底池 {i + 1} 分配 ({pot.amount} 籌碼):")

            # 找出有資格競爭這個底池的玩家
            eligible_hands = [(p, r, v, c) for p, r, v, c in player_hands if p in pot.eligible_players]

            if not eligible_hands:
                print("  沒有符合資格的玩家")
                continue

            # 找出最強的手牌
            eligible_hands.sort(key=lambda x: (x[1].numeric_value, x[2]), reverse=True)

            winners = [eligible_hands[0]]
            for j in range(1, len(eligible_hands)):
                if (eligible_hands[j][1].numeric_value == winners[0][1].numeric_value and
                        eligible_hands[j][2] == winners[0][2]):
                    winners.append(eligible_hands[j])
                else:
                    break

            # 分配這個底池
            pot_share = pot.amount // len(winners)
            remainder = pot.amount % len(winners)

            for j, winner_info in enumerate(winners):
                winner = winner_info[0]
                share = pot_share + (1 if j < remainder else 0)  # 餘數給前面的玩家
                winner.chips += share

                if len(self.side_pots) > 1:
                    print(f"  💰 {winner.name} 贏得 {share} 籌碼 ({winner_info[1].display})")
                else:
                    print(f"💰 {winner.name} 贏得 {share} 籌碼！")

            if len(winners) > 1:
                print(f"  🤝 {len(winners)} 位玩家平分此底池")

            print()

    def _count_active_players(self) -> int:
        """計算仍在遊戲中的玩家數量"""
        return len([p for p in self.players if not p.folded])

    def _get_best_five_cards(self, all_cards, rank, values):
        """找出最佳的5張牌組合"""
        from itertools import combinations

        best_combo = None
        best_rank_value = -1
        best_values = []

        # 嘗試所有5張牌的組合
        for combo in combinations(all_cards, 5):
            temp_hand = Hand(list(combo))
            combo_rank, combo_values = temp_hand._evaluate_five_cards(list(combo))

            if (combo_rank.numeric_value > best_rank_value or
                    (combo_rank.numeric_value == best_rank_value and combo_values > best_values)):
                best_combo = list(combo)
                best_rank_value = combo_rank.numeric_value
                best_values = combo_values

        # 按牌值排序以便顯示
        if best_combo:
            best_combo.sort(key=lambda x: x.rank.numeric_value, reverse=True)

        return best_combo or all_cards[:5]

    def _explain_hand_composition(self, rank, cards):
        """解釋牌型組成"""
        card_ranks = [card.rank.numeric_value for card in cards]
        card_suits = [card.suit for card in cards]

        # 檢查是否為A-2-3-4-5順子
        is_wheel_straight = False
        if rank in [HandRank.STRAIGHT, HandRank.STRAIGHT_FLUSH] and sorted(card_ranks) == [2, 3, 4, 5, 14]:
            is_wheel_straight = True

        if rank == HandRank.ROYAL_FLUSH:
            suit = cards[0].suit.value
            print(f"   → 皇家同花順 ({suit}): A-K-Q-J-10 同花色")

        elif rank == HandRank.STRAIGHT_FLUSH:
            suit = cards[0].suit.value
            if is_wheel_straight:
                print(f"   → 同花順 ({suit}): A-2-3-4-5 (最小同花順)")
            else:
                high_card = cards[0].rank.display
                print(f"   → 同花順 ({suit}): {high_card} 為最高的同花順")

        elif rank == HandRank.FOUR_KIND:
            from collections import Counter
            rank_counts = Counter(card_ranks)
            four_rank = max(rank_counts, key=rank_counts.get)
            four_card = next(card for card in cards if card.rank.numeric_value == four_rank)
            print(f"   → 四條: 四張 {four_card.rank.display}")

        elif rank == HandRank.FULL_HOUSE:
            from collections import Counter
            rank_counts = Counter(card_ranks)
            three_rank = max(rank_counts, key=rank_counts.get)
            pair_rank = min(rank_counts, key=rank_counts.get)
            three_card = next(card for card in cards if card.rank.numeric_value == three_rank)
            pair_card = next(card for card in cards if card.rank.numeric_value == pair_rank)
            print(f"   → 葫蘆: 三張 {three_card.rank.display} + 一對 {pair_card.rank.display}")

        elif rank == HandRank.FLUSH:
            suit = cards[0].suit.value
            high_card = cards[0].rank.display
            print(f"   → 同花 ({suit}): {high_card} 為最高牌")

        elif rank == HandRank.STRAIGHT:
            if is_wheel_straight:
                print(f"   → 順子: A-2-3-4-5 (最小順子)")
            else:
                high_card = cards[0].rank.display
                print(f"   → 順子: {high_card} 為最高的順子")

        elif rank == HandRank.THREE_KIND:
            from collections import Counter
            rank_counts = Counter(card_ranks)
            three_rank = max(rank_counts, key=rank_counts.get)
            three_card = next(card for card in cards if card.rank.numeric_value == three_rank)
            print(f"   → 三條: 三張 {three_card.rank.display}")

        elif rank == HandRank.TWO_PAIR:
            from collections import Counter
            rank_counts = Counter(card_ranks)
            pairs = [rank for rank, count in rank_counts.items() if count == 2]
            pairs.sort(reverse=True)
            pair1_card = next(card for card in cards if card.rank.numeric_value == pairs[0])
            pair2_card = next(card for card in cards if card.rank.numeric_value == pairs[1])
            print(f"   → 兩對: {pair1_card.rank.display} 和 {pair2_card.rank.display}")

        elif rank == HandRank.PAIR:
            from collections import Counter
            rank_counts = Counter(card_ranks)
            pair_rank = max(rank_counts, key=rank_counts.get)
            pair_card = next(card for card in cards if card.rank.numeric_value == pair_rank)
            print(f"   → 一對: 一對 {pair_card.rank.display}")

        elif rank == HandRank.HIGH_CARD:
            high_card = cards[0].rank.display
            print(f"   → 高牌: {high_card} 為最高牌")

    def _explain_why_won(self, winner_info, runner_up_info):
        """解釋為什麼贏了"""
        if not runner_up_info:
            print("只有一位玩家未棄牌")
            return

        winner_rank = winner_info[1]
        runner_up_rank = runner_up_info[1]

        if winner_rank.numeric_value > runner_up_rank.numeric_value:
            print(f"{winner_rank.display} 勝過 {runner_up_rank.display}")
        else:
            # 相同牌型，比較踢腳牌
            winner_values = winner_info[2]
            runner_up_values = runner_up_info[2]

            if winner_rank == HandRank.PAIR:
                print(f"對子大小或踢腳牌較大")
            elif winner_rank == HandRank.TWO_PAIR:
                print(f"對子大小或踢腳牌較大")
            elif winner_rank == HandRank.THREE_KIND:
                print(f"三條大小或踢腳牌較大")
            elif winner_rank == HandRank.STRAIGHT:
                print(f"順子較大")
            elif winner_rank == HandRank.FLUSH:
                print(f"同花中的牌較大")
            elif winner_rank == HandRank.FULL_HOUSE:
                print(f"葫蘆中的三條或對子較大")
            elif winner_rank == HandRank.FOUR_KIND:
                print(f"四條較大")
            elif winner_rank == HandRank.STRAIGHT_FLUSH:
                print(f"同花順較大")
            else:
                print(f"踢腳牌較大")

    def play(self):
        """開始遊戲"""
        print("德州撲克遊戲開始！")
        print(f"玩家: {', '.join(p.name for p in self.players)}")
        print(f"每位玩家起始籌碼: 1000")
        print(f"小盲注: {self.small_blind}, 大盲注: {self.big_blind}")
        print(f"首局莊家: {self.players[self.dealer_position].name}")

        while not self.game_over:
            self.start_new_hand()

            if not self.game_over:
                print("\n可用指令:")
                print("- 繼續遊戲: 輸入 'y'")
                print("- 查看規則: 輸入 'rules'")
                print("- 結束遊戲: 輸入 'n'")

                while True:
                    user_input = input("請選擇: ").strip().lower()
                    if user_input == 'y':
                        break
                    elif user_input == 'rules':
                        show_rules()
                    elif user_input == 'n':
                        self.game_over = True
                        break
                    else:
                        print("請輸入 'y'、'rules' 或 'n'")

        # 顯示最終結果
        print(f"\n{'=' * 50}")
        print("遊戲結束！最終結果:")
        print(f"{'=' * 50}")
        for player in sorted(self.players, key=lambda x: x.chips, reverse=True):
            print(f"{player.name}: {player.chips} 籌碼")

        # 宣布獲勝者
        winner = max(self.players, key=lambda x: x.chips)
        print(f"\n🎉 恭喜 {winner.name} 獲得最終勝利！ 🎉")


def show_rules():
    """顯示德州撲克規則說明"""
    print("=" * 60)
    print("                  德州撲克遊戲規則")
    print("=" * 60)

    print("\n【遊戲目標】")
    print("使用你的2張底牌和5張公共牌，組成最強的5張牌組合，贏得底池籌碼。")

    print("\n【牌型強度】(由強到弱)")
    print("1. 皇家同花順 - A、K、Q、J、10 同花色")
    print("2. 同花順     - 連續5張同花色牌")
    print("3. 四條       - 4張相同點數的牌")
    print("4. 葫蘆       - 3張相同 + 1對")
    print("5. 同花       - 5張相同花色但不連續")
    print("6. 順子       - 5張連續點數但不同花")
    print("7. 三條       - 3張相同點數的牌")
    print("8. 兩對       - 2對不同點數的對子")
    print("9. 一對       - 2張相同點數的牌")
    print("10. 高牌      - 沒有任何組合，比較最大牌")

    print("\n【遊戲流程】")
    print("1. 每位玩家發2張底牌（只有自己能看到）")
    print("2. 小盲注、大盲注強制下注")
    print("3. 翻牌前下注輪")
    print("4. 發3張公共牌（翻牌），進行下注")
    print("5. 發第4張公共牌（轉牌），進行下注")
    print("6. 發第5張公共牌（河牌），進行下注")
    print("7. 攤牌比較牌型大小，最強者贏得底池")

    print("\n【下注動作】")
    print("• Check（過牌）- 不下注但繼續參與")
    print("• Bet（下注）  - 主動下注一定金額")
    print("• Call（跟注） - 跟上當前最高下注")
    print("• Raise（加注）- 提高當前下注金額")
    print("• Fold（棄牌） - 放棄這局，不參與後續")
    print("• All-in（全下）- 把所有籌碼都下注")

    print("\n【盲注說明】")
    print("• 小盲注：莊家左邊第一位強制下注（本遊戲：10籌碼）")
    print("• 大盲注：莊家左邊第二位強制下注（本遊戲：20籌碼）")
    print("• 每局莊家位置順時針移動")

    print("\n【操作說明】")
    print("當輪到你時，請根據提示輸入：")
    print("• 過牌：輸入 'check'")
    print("• 下注：輸入 'bet 金額' (例如：bet 50)")
    print("• 跟注：輸入 'call'")
    print("• 加注：輸入 'raise 金額' (例如：raise 100)")
    print("• 棄牌：輸入 'fold'")

    print("\n【獲勝條件】")
    print("• 所有其他玩家都棄牌：你直接贏得底池")
    print("• 攤牌比較：擁有最強牌型的玩家贏得底池")
    print("• 平手：相同牌型的玩家平分底池")

    print("\n【特殊情況】")
    print("• All-in：籌碼不足時可全下，形成邊池")
    print("• 遊戲結束：只剩一位玩家有籌碼時")

    print("=" * 60)
    print("規則說明完畢！")


def main():
    """主函數"""
    print("歡迎來到德州撲克！")

    # 詢問是否查看規則
    while True:
        try:
            show_rules_choice = input("是否查看遊戲規則？(y/n): ").strip().lower()
            if show_rules_choice in ['y', 'yes']:
                show_rules()
                print()  # 空行分隔
                break
            elif show_rules_choice in ['n', 'no']:
                break
            else:
                print("請輸入 'y' (查看規則) 或 'n' (跳過規則)")
        except (EOFError, KeyboardInterrupt):
            print("\n程序被中斷")
            return
        except Exception as e:
            print(f"輸入錯誤: {e}")
            print("請重新輸入")

    # 獲取玩家數量和姓名
    print("現在開始設定遊戲...")
    while True:
        try:
            player_input = input("請輸入玩家數量 (2-8): ").strip()
            if player_input == "":
                print("請輸入一個數字")
                continue
            num_players = int(player_input)
            if 2 <= num_players <= 8:
                break
            else:
                print("玩家數量必須在2-8之間")
        except ValueError:
            print("請輸入有效的數字")
        except (EOFError, KeyboardInterrupt):
            print("\n程序被中斷")
            return
        except Exception as e:
            print(f"輸入錯誤: {e}")
            print("請重新輸入")

    player_names = []
    for i in range(num_players):
        while True:
            try:
                name = input(f"請輸入第{i + 1}個玩家的姓名: ").strip()
                if not name:
                    name = f"玩家{i + 1}"
                player_names.append(name)
                break
            except (EOFError, KeyboardInterrupt):
                print("\n程序被中斷")
                return
            except Exception as e:
                print(f"輸入錯誤: {e}")
                print("請重新輸入")

    # 創建並開始遊戲
    try:
        game = PokerGame(player_names)
        game.play()
    except (EOFError, KeyboardInterrupt):
        print("\n遊戲被中斷，感謝遊玩！")
    except Exception as e:
        print(f"遊戲錯誤: {e}")
        print("遊戲異常結束")


if __name__ == "__main__":
    main()