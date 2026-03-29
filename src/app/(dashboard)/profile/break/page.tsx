'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

const GRID_SIZE = 16;
const INITIAL_SNAKE = [
  { x: 7, y: 8 },
  { x: 6, y: 8 },
  { x: 5, y: 8 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const TICK_MS = 140;

type Cell = { x: number; y: number };
type Direction = { x: number; y: number };

function cellsEqual(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function randomFood(snake: Cell[]) {
  const freeCells: Cell[] = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const occupied = snake.some((cell) => cell.x === x && cell.y === y);
      if (!occupied) {
        freeCells.push({ x, y });
      }
    }
  }

  if (!freeCells.length) {
    return null;
  }

  return freeCells[Math.floor(Math.random() * freeCells.length)];
}

function isOpposite(next: Direction, current: Direction) {
  return next.x === -current.x && next.y === -current.y;
}

export default function ProfileBreakPage() {
  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Cell | null>(() => randomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const directionRef = useRef<Direction>(INITIAL_DIRECTION);

  const resetGame = useCallback(() => {
    directionRef.current = INITIAL_DIRECTION;
    setSnake(INITIAL_SNAKE);
    setFood(randomFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    setRunning(false);
    setGameOver(false);
    setScore(0);
  }, []);

  const startGame = useCallback(() => {
    if (gameOver) {
      resetGame();
      setRunning(true);
      return;
    }
    setRunning(true);
  }, [gameOver, resetGame]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      let nextDirection: Direction | null = null;

      if (event.key === 'ArrowUp') nextDirection = { x: 0, y: -1 };
      if (event.key === 'ArrowDown') nextDirection = { x: 0, y: 1 };
      if (event.key === 'ArrowLeft') nextDirection = { x: -1, y: 0 };
      if (event.key === 'ArrowRight') nextDirection = { x: 1, y: 0 };

      if (!nextDirection) return;

      event.preventDefault();

      if (!running && !gameOver) {
        setRunning(true);
      }

      if (isOpposite(nextDirection, directionRef.current)) {
        return;
      }

      directionRef.current = nextDirection;
      setDirection(nextDirection);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [running, gameOver]);

  useEffect(() => {
    if (!running || gameOver) return;

    const timer = window.setInterval(() => {
      setSnake((currentSnake) => {
        const currentDirection = directionRef.current;
        const head = currentSnake[0];
        const nextHead = {
          x: (head.x + currentDirection.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + currentDirection.y + GRID_SIZE) % GRID_SIZE,
        };

        const ateFood = food && cellsEqual(nextHead, food);
        const collisionBody = ateFood ? currentSnake : currentSnake.slice(0, -1);
        const hitsSelf = collisionBody.some((cell) => cellsEqual(cell, nextHead));

        if (hitsSelf) {
          setRunning(false);
          setGameOver(true);
          return currentSnake;
        }

        const nextSnake = [nextHead, ...currentSnake];

        if (!ateFood) {
          nextSnake.pop();
        } else {
          setScore((value) => value + 1);
          setFood(randomFood(nextSnake));
        }

        return nextSnake;
      });
    }, TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [running, gameOver, food]);

  const board = useMemo(() => {
    const cells: Array<{
      key: string;
      isHead: boolean;
      isSnake: boolean;
      isFood: boolean;
    }> = [];

    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const isHead = snake[0]?.x === x && snake[0]?.y === y;
        const isSnake = snake.some((cell) => cell.x === x && cell.y === y);
        const isFood = food?.x === x && food?.y === y;

        cells.push({
          key: `${x}-${y}`,
          isHead,
          isSnake,
          isFood: Boolean(isFood),
        });
      }
    }

    return cells;
  }, [snake, food]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Отдохнуть 2 минуты"
        description="Небольшая пауза между задачами. Управляйте змейкой стрелками на клавиатуре."
        actions={
          <div className="flex gap-3">
            <Link href="/profile">
              <Button variant="secondary">Вернуться в профиль</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-white">Змейка</div>
                <div className="mt-1 text-sm text-slate-400">
                  Стрелки вверх, вниз, влево, вправо — управление.
                </div>
              </div>

              <div className="flex gap-3">
                {!running ? (
                  <Button onClick={startGame}>
                    {gameOver ? 'Начать заново' : 'Старт'}
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={() => setRunning(false)}>
                    Пауза
                  </Button>
                )}

                <Button variant="secondary" onClick={resetGame}>
                  Сброс
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
              <div
                className="grid aspect-square w-full max-w-[640px] mx-auto gap-1"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              >
                {board.map((cell) => (
                  <div
                    key={cell.key}
                    className={`aspect-square rounded-[6px] border border-white/5 ${
                      cell.isFood
                        ? 'bg-rose-400'
                        : cell.isHead
                          ? 'bg-amber-300'
                          : cell.isSnake
                            ? 'bg-emerald-400'
                            : 'bg-slate-800/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="space-y-4">
              <div className="text-lg font-semibold text-white">Статистика</div>
              <InfoRow label="Счёт" value={String(score)} />
              <InfoRow label="Скорость" value={`${TICK_MS} мс`} />
              <InfoRow
                label="Статус"
                value={gameOver ? 'Игра окончена' : running ? 'Игра идёт' : 'Ожидание'}
              />
            </div>
          </Card>

          <Card>
            <div className="space-y-4 text-sm leading-6 text-slate-300">
              <div className="text-lg font-semibold text-white">Правила</div>
              <p>Съедайте еду, чтобы увеличить счёт и длину змейки.</p>
              <p>Нельзя врезаться в стены и в собственное тело.</p>
              <p>Нажмите «Старт» и сразу используйте стрелки на клавиатуре.</p>
            </div>
          </Card>

          {gameOver ? (
            <Card>
              <div className="space-y-3">
                <div className="text-lg font-semibold text-white">Игра окончена</div>
                <div className="text-sm text-slate-300">
                  Ваш результат: <span className="font-medium text-white">{score}</span>
                </div>
                <Button onClick={startGame}>Сыграть ещё раз</Button>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
