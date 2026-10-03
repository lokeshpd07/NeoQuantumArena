import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronRight, LockKeyhole, Play, Sparkles, Zap, X, BookOpen } from "lucide-react";
import { useState } from "react";
import { PageShell, PageTitle, Panel, ProgressBar } from "@/components/quantum-shell";
import { Button } from "@/components/ui/button";
import { lessons } from "@/data/quantum";
import { useGameState } from "@/hooks/use-game-state";
import { gameStore } from "@/lib/game-state";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learning Path — NeoQuantum Arena" },
      { name: "description", content: "Master quantum concepts through visual, interactive learning missions." },
    ],
  }),
  component: Learn,
});

function Learn() {
  const state = useGameState();
  const [activeLesson, setActiveLesson] = useState<(typeof lessons)[0] | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lessonPhase, setLessonPhase] = useState<"reading" | "quiz" | "complete">("reading");
  const navigate = useNavigate();

  const totalCleared = lessons.filter(
    (l) => (state.lessonProgress[l.id] ?? l.progress ?? 0) >= 100
  ).length;

  function openLesson(lesson: typeof lessons[0]) {
    const prog = state.lessonProgress[lesson.id] ?? lesson.progress ?? 0;
    if (prog === 0 && lesson.id > 1) {
      // Unlock check: previous lesson must be > 0
      const prevProgress = state.lessonProgress[lesson.id - 1] ?? lessons[lesson.id - 2]?.progress ?? 0;
      if (prevProgress === 0) return; // still locked
    }
    setActiveLesson(lesson);
    setLessonPhase("reading");
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }

  function handleAnswer(idx: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
  }

  function nextQuestion() {
    if (!activeLesson) return;
    const nextIdx = quizIndex + 1;
    if (nextIdx >= activeLesson.content.quiz.length) {
      // All questions done
      gameStore.completeLesson(activeLesson.id, 30);
      setLessonPhase("complete");
    } else {
      setQuizIndex(nextIdx);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }

  function closeLesson() {
    setActiveLesson(null);
    setLessonPhase("reading");
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }

  if (activeLesson) {
    const prog = state.lessonProgress[activeLesson.id] ?? activeLesson.progress;
    const quiz = activeLesson.content.quiz[quizIndex];
    return (
      <PageShell>
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-auto bg-background/90 p-4 pt-20 backdrop-blur-sm">
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Panel className="overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-5">
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-primary">{activeLesson.level}</span>
                  <h2 className="mt-1 text-xl font-extrabold">{activeLesson.title}</h2>
                </div>
                <button
                  onClick={closeLesson}
                  aria-label="Close lesson"
                  className="grid size-8 place-items-center rounded-md hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>

              {lessonPhase === "reading" && (
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <BookOpen className="size-3" />
                    <span>{activeLesson.duration} · +{activeLesson.xp} XP</span>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: activeLesson.content.intro.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                    }}
                  />
                  <div className="mt-6 grid gap-3">
                    {activeLesson.content.concepts.map((c) => (
                      <div key={c.term} className="rounded-md border border-border bg-accent/50 p-4">
                        <div className="flex items-center gap-2">
                          <span className="rounded-sm bg-primary px-2 py-0.5 font-mono text-xs font-bold text-primary-foreground">{c.term}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{c.definition}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6 w-full" id="start-quiz-btn" onClick={() => setLessonPhase("quiz")}>
                    Start Quiz <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}

              {lessonPhase === "quiz" && quiz && (
                <div className="p-6">
                  <div className="mb-4 flex justify-between font-mono text-xs text-muted-foreground">
                    <span>Question {quizIndex + 1} of {activeLesson.content.quiz.length}</span>
                    <span>+{Math.round(activeLesson.xp / activeLesson.content.quiz.length)} XP</span>
                  </div>
                  <h3 className="text-lg font-bold">{quiz.question}</h3>
                  <div className="mt-5 grid gap-3">
                    {quiz.options.map((opt, idx) => {
                      let cls = "border-border bg-background hover:border-primary hover:bg-accent";
                      if (selectedAnswer !== null) {
                        if (idx === quiz.correct) cls = "border-success bg-success/10";
                        else if (idx === selectedAnswer && idx !== quiz.correct) cls = "border-destructive bg-destructive/10";
                        else cls = "border-border opacity-50";
                      }
                      return (
                        <button
                          key={idx}
                          id={`answer-${idx}`}
                          onClick={() => handleAnswer(idx)}
                          className={`rounded-md border p-4 text-left text-sm transition-all ${cls}`}
                        >
                          <span className="mr-3 font-mono text-xs text-muted-foreground">{String.fromCharCode(65 + idx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {showExplanation && (
                    <div className={`mt-4 rounded-md p-4 text-sm ${selectedAnswer === quiz.correct ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      <b>{selectedAnswer === quiz.correct ? "Correct! ✓" : "Not quite."}</b>
                      <p className="mt-1 text-foreground/80">{quiz.explanation}</p>
                      <Button className="mt-4 w-full" id="next-question-btn" onClick={nextQuestion}>
                        {quizIndex + 1 >= activeLesson.content.quiz.length ? "Finish lesson" : "Next question"} <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {lessonPhase === "complete" && (
                <div className="p-8 text-center">
                  <div className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success">
                    <Check className="size-10" />
                  </div>
                  <h3 className="mt-6 text-2xl font-extrabold">Lesson complete!</h3>
                  <p className="mt-2 text-muted-foreground">You earned XP and progressed your skill constellation.</p>
                  <div className="mt-6 flex gap-3">
                    <Button variant="secondary" className="flex-1" id="close-lesson-btn" onClick={closeLesson}>
                      Back to path
                    </Button>
                    <Button className="flex-1" id="go-to-lab-btn" onClick={() => { closeLesson(); navigate({ to: "/lab" }); }}>
                      Try in lab <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </div>
        {/* Dimmed background path */}
        <div className="pointer-events-none opacity-30">
          <PageTitle eyebrow="Campaign map" title="Quantum learning path" description="Every concept unlocks a new set of circuits, challenges, and arena abilities." action={<span />} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageTitle
        eyebrow="Campaign map"
        title="Quantum learning path"
        description="Every concept unlocks a new set of circuits, challenges, and arena abilities."
        action={
          <div className="font-mono text-xs">
            <b className="text-primary">{totalCleared} / {lessons.length}</b> lessons cleared
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const prog: number = state.lessonProgress[lesson.id] ?? lesson.progress ?? 0;
            const prevProg: number = lesson.id === 1 ? 100 : (state.lessonProgress[lesson.id - 1] ?? lessons[lesson.id - 2]?.progress ?? 0);
            const isLocked = prog === 0 && lesson.id > 1 && prevProg === 0;

            return (
              <Panel
                key={lesson.id}
                className={`group p-5 transition-all ${isLocked ? "opacity-60" : "hover:border-primary/50 cursor-pointer"}`}
                onClick={() => !isLocked && openLesson(lesson)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`grid size-12 shrink-0 place-items-center rounded-md font-mono font-bold ${
                      prog === 100
                        ? "bg-success text-primary-foreground"
                        : prog > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {prog === 100 ? <Check /> : isLocked ? <LockKeyhole className="size-4" /> : String(lesson.id).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h2 className="font-bold md:text-lg">{lesson.title}</h2>
                      <span className="font-mono text-[10px] uppercase text-muted-foreground">{lesson.level}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{lesson.duration}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <ProgressBar value={prog} />
                      <span className="w-9 font-mono text-xs">{prog}%</span>
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <span className="font-mono text-xs text-primary">+{lesson.xp} XP</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2"
                      disabled={isLocked}
                      id={`lesson-open-${lesson.id}`}
                      aria-label={`Open ${lesson.title}`}
                      onClick={(e) => { e.stopPropagation(); !isLocked && openLesson(lesson); }}
                    >
                      {prog > 0 && !isLocked ? <ArrowRight className="size-4" /> : <LockKeyhole className="size-4" />}
                    </Button>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>

        <aside className="space-y-5">
          {/* Concept preview */}
          <Panel className="overflow-hidden">
            <div className="relative grid h-48 place-items-center overflow-hidden bg-foreground text-background">
              <div className="absolute size-40 rounded-full border border-cyan/40 quantum-pulse" />
              <div className="absolute size-24 rounded-full border border-dashed border-background/30 animate-spin [animation-duration:14s]" />
              <button
                aria-label="Play concept preview"
                className="relative grid size-14 place-items-center rounded-full bg-primary shadow-lg"
              >
                <Play className="ml-1" />
              </button>
            </div>
            <div className="p-5">
              <span className="font-mono text-[10px] font-bold uppercase text-primary">Interactive concept</span>
              <h3 className="mt-2 text-lg font-bold">See superposition</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Rotate a qubit and watch its probability amplitudes change in real time.
              </p>
              <Button asChild variant="secondary" className="mt-4 w-full" id="try-visualization-btn">
                <Link to="/lab">Try visualization</Link>
              </Button>
            </div>
          </Panel>

          {/* Mastery reward */}
          <Panel className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <b>Mastery reward</b>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete the core track to earn the Entangler badge.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-md bg-accent p-3">
              <span className="font-mono text-xs font-bold">{lessons.length - totalCleared} MODULES LEFT</span>
              <Zap className="size-4 text-warning" />
            </div>
          </Panel>

          {/* Quick actions */}
          <Panel className="p-5">
            <b>Quick actions</b>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="secondary" className="w-full justify-start" id="go-arena-btn">
                <Link to="/arena"><Zap className="size-4 text-primary" /> Challenge Arena</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full justify-start" id="go-battle-btn">
                <Link to="/battle"><Sparkles className="size-4 text-primary" /> Live Battle</Link>
              </Button>
            </div>
          </Panel>
        </aside>
      </div>
    </PageShell>
  );
}