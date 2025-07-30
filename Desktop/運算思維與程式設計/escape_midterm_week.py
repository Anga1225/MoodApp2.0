import pygame
import random
import sys

pygame.init()

WIDTH = 800
HEIGHT = 300
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("逃出期中週：Dino 模式")

WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
YELLOW = (255, 255, 0)
GRAY = (100, 100, 100)
RED = (200, 50, 50)
BG_COLOR = (40, 40, 70)

clock = pygame.time.Clock()
FPS = 60

# 字體與分數
font = pygame.font.SysFont("Comic Sans MS", 24)

def reset_game():
    return {
        "player_x": 100,
        "player_y": HEIGHT - player_height - 20,
        "player_vel_y": 0,
        "is_jumping": False,
        "obstacles": [],
        "score": 0,
        "spawn_timer": 0,
        "obstacle_speed": 6
    }

# 初始設定
player_width = 40
player_height = 40
gravity = 0.6
jump_strength = -12
obstacle_width = 30
obstacle_height = 50

game_over = False
state = reset_game()

# 遊戲主迴圈
running = True
while running:
    clock.tick(FPS)
    screen.fill(BG_COLOR)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        if not game_over and event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and not state["is_jumping"]:
                state["player_vel_y"] = jump_strength
                state["is_jumping"] = True

        if game_over and event.type == pygame.KEYDOWN:
            if event.key == pygame.K_r:
                state = reset_game()
                game_over = False

    if not game_over:
        # 加速度提升（隨分數變快）
        state["obstacle_speed"] = 6 + int(state["score"] // 100)

        # 玩家跳躍邏輯
        state["player_vel_y"] += gravity
        state["player_y"] += state["player_vel_y"]
        if state["player_y"] >= HEIGHT - player_height - 20:
            state["player_y"] = HEIGHT - player_height - 20
            state["player_vel_y"] = 0
            state["is_jumping"] = False

        # 生成障礙物
        state["spawn_timer"] += 1
        if state["spawn_timer"] > 90 - min(60, int(state["score"] // 10)):  # 加快生成頻率
            y = HEIGHT - obstacle_height - 20
            rect = pygame.Rect(WIDTH, y, obstacle_width, obstacle_height)
            state["obstacles"].append(rect)
            state["spawn_timer"] = 0

        # 移動障礙物
        new_obstacles = []
        for obs in state["obstacles"]:
            obs.x -= state["obstacle_speed"]
            if obs.right > 0:
                new_obstacles.append(obs)

            player_rect = pygame.Rect(state["player_x"], state["player_y"], player_width, player_height)
            if player_rect.colliderect(obs):
                game_over = True

        state["obstacles"] = new_obstacles

        # 得分增加
        state["score"] += 1

        # 畫主角
        pygame.draw.rect(screen, YELLOW, (state["player_x"], state["player_y"], player_width, player_height))

        # 畫障礙物
        for obs in state["obstacles"]:
            pygame.draw.rect(screen, GRAY, obs)

        # 畫分數
        score_text = font.render(f"GPA: {int(state['score'] / 10)}", True, WHITE)
        screen.blit(score_text, (10, 10))

    else:
        over_text = font.render("你被期中考追到了！按 R 重來", True, RED)
        screen.blit(over_text, (WIDTH//2 - over_text.get_width()//2, HEIGHT//2))

    pygame.draw.line(screen, WHITE, (0, HEIGHT - 20), (WIDTH, HEIGHT - 20), 2)
    pygame.display.flip()

pygame.quit()
sys.exit()
