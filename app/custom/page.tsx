"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

/* ================== Types ================== */
type VocabItem = { en: string; vn: string };
type Mode =
  | ""
  | "en-to-vn"
  | "vn-to-en"
  | "quiz-en"
  | "quiz-vn"
  | "flash-en"
  | "flash-vn";
type Outcome = "ok" | "bad" | null;

/* ================== Utils ================== */
const LS_KEY_SOURCE = "sheet_source_link";
const LS_KEY_COLLAPSED = "sheet_panel_collapsed";

function extractIdGid(raw: string | null) {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (!/docs\.google\.com$/i.test(u.hostname)) return null;
    const m = u.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9\-_]+)/);
    if (!m) return null;
    const id = m[1];
    let gid = u.searchParams.get("gid") || "0";
    if (gid === "0" && u.hash) {
      const m2 = u.hash.match(/gid=(\d+)/);
      if (m2) gid = m2[1];
    }
    return { id, gid };
  } catch {
    return null;
  }
}
function buildCsvUrl(id: string, gid: string) {
  const u = new URL(`https://docs.google.com/spreadsheets/d/${id}/export`);
  u.searchParams.set("format", "csv");
  u.searchParams.set("gid", gid || "0");
  u.searchParams.set("_", Date.now().toString());
  return u.toString();
}
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\r") {
        /* skip */
      } else if (ch === "\n") {
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  row.push(cur);
  rows.push(row);
  return rows;
}
function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ================== Component ================== */
export default function CustomVocabPage() {
  /* ----- Sheet config ----- */
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [sheetGid, setSheetGid] = useState("0");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ----- Help modal ----- */
  const [showHelp, setShowHelp] = useState(false);
  const [activeHelpSection, setActiveHelpSection] = useState<
    "guide" | "modes" | "actions" | "faq"
  >("guide");

  /* ----- Game state ----- */
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [mode, setModeState] = useState<Mode>("");
  const [pool, setPool] = useState<VocabItem[]>([]);
  const [index, setIndex] = useState(0); // 1-based display uses index+1
  const [current, setCurrent] = useState<VocabItem | null>(null);

  const [answerLang, setAnswerLang] = useState<"en" | "vn">("vn");
  const [answerText, setAnswerText] = useState("");
  const answerRef = useRef<HTMLInputElement | null>(null);

  const [choices, setChoices] = useState<string[]>([]); // quiz options
  const [correctChoice, setCorrectChoice] = useState<string>("");

  const [answered, setAnswered] = useState(false);
  const [showingResult, setShowingResult] = useState(false);
  const [flashShown, setFlashShown] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [lastOutcome, setLastOutcome] = useState<Outcome>(null);

  /* ---------- Init: sheet + collapsed ---------- */
  useEffect(() => {
    const savedUrl = localStorage.getItem(LS_KEY_SOURCE);
    if (savedUrl) setSheetUrl(savedUrl);
    const parts = extractIdGid(savedUrl || "");
    if (parts) {
      setSheetId(parts.id);
      setSheetGid(parts.gid || "0");
      void loadData(parts.id, parts.gid || "0");
    }
    const collapsed = localStorage.getItem(LS_KEY_COLLAPSED) === "1";
    setIsCollapsed(collapsed);
  }, []);

  /* ---------- Keyboard hotkeys ---------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!mode) return;

      if (mode.startsWith("flash")) {
        if (e.code === "Space") {
          e.preventDefault();
          if (!flashShown) showFlashAnswer();
          return;
        }
        if (e.key === "Enter" && flashShown) {
          e.preventDefault();
          flashKnow();
          return;
        }
        if (e.key === "Escape" && flashShown) {
          e.preventDefault();
          flashAgain();
          return;
        }
        return;
      }

      if (e.key === "Enter") {
        if (!answered) {
          if (mode === "en-to-vn" || mode === "vn-to-en") {
            e.preventDefault();
            checkInputAnswer();
          }
        } else if (showingResult) {
          e.preventDefault();
          handleNext();
        }
      } else if (e.key === "Escape") {
        if (showingResult) {
          e.preventDefault();
          retryQuestion();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    mode,
    answered,
    showingResult,
    flashShown,
    answerText,
    answerLang,
    current,
    index,
    pool,
    correctChoice,
  ]);

  /* ---------- Derived ---------- */
  const progress = useMemo(() => {
    return pool.length > 0 ? (completedCount / pool.length) * 100 : 0;
  }, [pool.length, completedCount]);

  /* ================== Data ================== */
  async function loadData(id: string, gid: string, _showToast = false) {
    setLoading(true);
    try {
      const csvUrl = buildCsvUrl(id, gid);
      const res = await fetch(csvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const table = parseCSV(text);
      if (!table.length) throw new Error("Sheet trống");

      let parsed = table.map((cols) => ({
        en: (cols[0] ?? "").toString().trim(),
        vn: (cols[1] ?? "").toString().trim(),
      }));
      // remove header
      if (
        parsed.length &&
        parsed[0].en.toLowerCase() === "en" &&
        parsed[0].vn.toLowerCase() === "vn"
      ) {
        parsed.shift();
      }
      parsed = parsed.filter((x) => x.en && x.vn);
      if (!parsed.length)
        throw new Error("Không có dữ liệu hợp lệ (cột A=en, B=vn).");

      setVocab(parsed);
    } catch (e: any) {
      console.error("Load data error:", e);
      setVocab([]);
      alert(`Lỗi tải Google Sheet: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  }

  /* ================== Sheet UI ================== */
  function toggleCollapse() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem(LS_KEY_COLLAPSED, next ? "1" : "0");
  }
  async function onSaveSheet(e: React.FormEvent) {
    e.preventDefault();
    const parts = extractIdGid(sheetUrl);
    if (!parts) {
      alert("Link không hợp lệ. Hãy kiểm tra và thử lại.");
      return;
    }
    setSheetId(parts.id);
    setSheetGid(parts.gid || "0");
    localStorage.setItem(LS_KEY_SOURCE, sheetUrl);
    await loadData(parts.id, parts.gid || "0", true);
  }
  function clearSavedSheet() {
    localStorage.removeItem(LS_KEY_SOURCE);
    setSheetId(null);
    setSheetGid("0");
    setSheetUrl("");
    resetAll();
  }
  function reloadFromSaved() {
    const saved = localStorage.getItem(LS_KEY_SOURCE);
    if (!saved) {
      alert("Chưa có link đã lưu.");
      return;
    }
    const parts = extractIdGid(saved);
    if (!parts) {
      alert("Link đã lưu không hợp lệ.");
      return;
    }
    void loadData(parts.id, parts.gid || "0", true);
  }

  /* ================== Game core ================== */
  function resetAll() {
    setModeState("");
    setPool([]);
    setIndex(0);
    setCurrent(null);
    setAnswerText("");
    setChoices([]);
    setCorrectChoice("");
    setAnswered(false);
    setShowingResult(false);
    setFlashShown(false);
    setCorrectCount(0);
    setWrongCount(0);
    setCompletedCount(0);
    setLastOutcome(null);
  }

  function startMode(selected: Mode) {
    if (!vocab.length) {
      alert("Chưa có dữ liệu. Hãy cấu hình Google Sheet trước.");
      return;
    }
    const p = shuffle(vocab);
    setModeState(selected);
    setPool(p);
    setIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompletedCount(0);
    setLastOutcome(null);
    setAnswered(false);
    setShowingResult(false);
    setFlashShown(false);

    // set answer language cho 2 chế độ nhập
    if (selected === "en-to-vn") setAnswerLang("vn");
    if (selected === "vn-to-en") setAnswerLang("en");

    // bắt đầu câu đầu tiên
    setTimeout(() => nextQuestion(p, 0, selected), 0);
  }

  function nextQuestion(
    nextPool?: VocabItem[],
    iOverride?: number,
    mOverride?: Mode
  ) {
    const usedPool = nextPool ?? pool;
    const usedIndex = iOverride ?? index;
    const usedMode = mOverride ?? mode;

    if (usedIndex >= usedPool.length) {
      // finished
      setCurrent(null);
      setAnswered(false);
      setShowingResult(false);
      setFlashShown(false);
      return;
    }

    const cur = usedPool[usedIndex];
    setCurrent(cur);
    setIndex(usedIndex + 1); // display is 1-based
    setAnswered(false);
    setShowingResult(false);
    setFlashShown(false);
    setAnswerText("");

    // quiz options
    if (usedMode === "quiz-en") {
      const opts = getOptions("vn", cur.vn, vocab);
      setChoices(opts);
      setCorrectChoice(cur.vn);
    } else if (usedMode === "quiz-vn") {
      const opts = getOptions("en", cur.en, vocab);
      setChoices(opts);
      setCorrectChoice(cur.en);
    } else {
      setChoices([]);
      setCorrectChoice("");
    }

    // focus input nếu cần
    setTimeout(() => answerRef.current?.focus(), 30);
  }

  function updateProgressCounters(ok: boolean) {
    setCompletedCount((c) => Math.min(c + 1, pool.length));
    if (ok) {
      setCorrectCount((c) => c + 1);
      setLastOutcome("ok");
    } else {
      setWrongCount((c) => c + 1);
      setLastOutcome("bad");
    }
  }

  function rollbackLastOutcome() {
    setCompletedCount((c) => Math.max(0, c - 1));
    setLastOutcome((last) => {
      if (last === "ok") setCorrectCount((x) => Math.max(0, x - 1));
      if (last === "bad") setWrongCount((x) => Math.max(0, x - 1));
      return null;
    });
  }

  function checkInputAnswer() {
    if (!current || answered) return;
    const input = (answerText || "").trim().toLowerCase();
    const correct = (current[answerLang] || "").toLowerCase(); // en-to-vn => so với vn; vn-to-en => so với en
    const ok = input === correct;
    updateProgressCounters(ok);
    setAnswered(true);
    setShowingResult(true);
  }

  function chooseOption(choice: string) {
    if (!current || answered) return;
    const ok = choice === correctChoice;
    updateProgressCounters(ok);
    setAnswered(true);
    setShowingResult(true);
  }

  function retryQuestion() {
    // trả lại tiến độ & điểm của câu vừa chấm
    rollbackLastOutcome();
    // hiển thị lại CHÍNH câu hiện tại
    nextQuestion(pool, index - 1, mode); // index là 1-based
  }

  function handleNext() {
    nextQuestion(pool, index, mode); // sang câu tiếp theo
  }

  function showFlashAnswer() {
    if (flashShown) return;
    setFlashShown(true);
  }
  function flashKnow() {
    updateProgressCounters(true);
    handleNext();
  }
  function flashAgain() {
    // lặp lại ngay câu hiện tại
    nextQuestion(pool, index - 1, mode);
  }

  /* helpers */
  function getOptions(
    field: "en" | "vn",
    correct: string,
    all: VocabItem[]
  ): string[] {
    const options = new Set<string>([correct]);
    const poolVals = all.map((v) => v[field]).filter(Boolean);
    while (options.size < Math.min(4, poolVals.length)) {
      const item = poolVals[Math.floor(Math.random() * poolVals.length)];
      options.add(item);
    }
    return shuffle(Array.from(options));
  }

  /* ================== Render ================== */
  const finished = current == null && mode !== "";

  const promptTitle =
    mode === "en-to-vn"
      ? "Translate to Vietnamese"
      : mode === "vn-to-en"
      ? "Translate to English"
      : mode === "quiz-en"
      ? "What is the meaning of"
      : mode === "quiz-vn"
      ? "What is the English of"
      : "Flashcard";

  // Câu hỏi lớn (KHÔNG dùng cho flashcard để tránh trùng lặp)
  const bigQuestion =
    mode === "en-to-vn" || mode === "quiz-en"
      ? current?.en
      : mode === "vn-to-en" || mode === "quiz-vn"
      ? current?.vn
      : ""; // flashcard -> rỗng

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              V
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-blue-400 dark:to-purple-400">
                Vocab Practice Game
              </h1>
              <p className="text-gray-600 dark:text-slate-300 text-sm">
                EN ⇄ VN • Enter = Submit/Next • Esc = Try Again
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHelp(true)}
              className="bg-white/80 hover:bg-white dark:bg-slate-700/80 dark:hover:bg-slate-700 border-indigo-200 dark:border-slate-600 text-indigo-700 dark:text-indigo-300 shadow-sm"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Hướng dẫn
            </Button>
          </div>
        </div>

        {/* Google Sheet Configuration */}
        <Card className="mb-6 bg-white/90 dark:bg-slate-800/90 border-indigo-200/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-xs text-white font-bold">📊</span>
                  </div>
                  Google Sheet
                </CardTitle>
                <Badge variant={sheetId ? "default" : "secondary"} className={sheetId ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : ""}>
                  {sheetId ? "Đang dùng link đã lưu" : "Chưa cấu hình"}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-300"
              >
                {isCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
                {isCollapsed ? "Mở rộng" : "Thu gọn"}
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Dán link Google Sheet đã bật{" "}
              <strong className="text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">
                Anyone with the link → Viewer
              </strong>
            </p>
          </CardHeader>

          {!isCollapsed && (
            <CardContent>
              <form onSubmit={onSaveSheet} className="flex gap-2 mb-4">
                <Input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/......../edit#gid=0"
                  className="flex-1 border-indigo-200 dark:border-slate-600 focus:border-indigo-400 dark:focus:border-indigo-400"
                  required
                />
                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  {loading ? "Đang tải..." : "Lưu link"}
                </Button>
              </form>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearSavedSheet} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20">
                  Xóa link đã lưu
                </Button>
                <Button variant="outline" onClick={reloadFromSaved} className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
                  Tải lại dữ liệu
                </Button>
              </div>

              {sheetId && (
                <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                  CSV: {buildCsvUrl(sheetId, sheetGid)}
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Game Modes */}
        <Card className="bg-white/90 dark:bg-slate-800/90 border-indigo-200/50 dark:border-slate-700/50 shadow-lg backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={mode === "en-to-vn" ? "default" : "outline"}
                onClick={() => startMode("en-to-vn")}
                disabled={!vocab.length}
                className={mode === "en-to-vn" ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" : "border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-900/20"}
              >
                ✍️ EN → VN (Input)
              </Button>
              <Button
                variant={mode === "vn-to-en" ? "default" : "outline"}
                onClick={() => startMode("vn-to-en")}
                disabled={!vocab.length}
                className={mode === "vn-to-en" ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" : "border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-900/20"}
              >
                ✍️ VN → EN (Input)
              </Button>
              <Button
                variant={mode === "quiz-en" ? "default" : "outline"}
                onClick={() => startMode("quiz-en")}
                disabled={!vocab.length}
                className={mode === "quiz-en" ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700" : "border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"}
              >
                ✅ Quiz (EN → VN)
              </Button>
              <Button
                variant={mode === "quiz-vn" ? "default" : "outline"}
                onClick={() => startMode("quiz-vn")}
                disabled={!vocab.length}
                className={mode === "quiz-vn" ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700" : "border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"}
              >
                ✅ Quiz (VN → EN)
              </Button>
              <Button
                variant={mode === "flash-en" ? "default" : "outline"}
                onClick={() => startMode("flash-en")}
                disabled={!vocab.length}
                className={mode === "flash-en" ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/20"}
              >
                🪪 Flashcard (EN → VN)
              </Button>
              <Button
                variant={mode === "flash-vn" ? "default" : "outline"}
                onClick={() => startMode("flash-vn")}
                disabled={!vocab.length}
                className={mode === "flash-vn" ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-900/20"}
              >
                🪪 Flashcard (VN → EN)
              </Button>
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-orange-300 border-0">Live data</Badge>
            </div>

            {/* HUD */}
            {mode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Progress value={progress} className="flex-1 mr-4" />
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-green-600">
                      ✔ Correct: {correctCount}
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      ✖ Wrong: {wrongCount}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Game Container */}
            <Card className="min-h-[200px] bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-slate-800/50 border-indigo-200/50 dark:border-slate-700/50 shadow-inner">
              <CardContent className="pt-6 text-center">
                {!vocab.length ? (
                  <p className="text-gray-600 dark:text-slate-300">
                    {loading
                      ? "Đang tải dữ liệu từ Google Sheet..."
                      : "Chưa có dữ liệu. Hãy dán link Sheet ở phía trên để bắt đầu."}
                  </p>
                ) : !mode ? (
                  <p className="text-gray-600 dark:text-slate-300">
                    Đã tải {vocab.length} mục. Chọn chế độ để chơi.
                  </p>
                ) : finished ? (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">🎉 Hoàn thành!</h3>
                    <p className="mb-4">
                      Score • ✔ {correctCount} — ✖ {wrongCount}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => startMode(mode)}>
                        Play Again
                      </Button>
                      <Button variant="outline" onClick={() => resetAll()}>
                        Return to Menu
                      </Button>
                    </div>
                  </div>
                ) : current ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold">
                        {mode.startsWith("flash") ? "Item" : "Question"} {index}
                        /{pool.length}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-green-600">
                          ✔ {correctCount}
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          ✖ {wrongCount}
                        </Badge>
                      </div>
                    </div>

                    {/* Prompt */}
                    <p className="text-lg mb-2">{promptTitle}</p>
                    {/* Hiển thị câu hỏi lớn CHỈ CHO input/quiz (tránh trùng với flashcard) */}
                    {mode !== "flash-en" && mode !== "flash-vn" && (
                      <p className="text-2xl font-bold mb-4">{bigQuestion}</p>
                    )}

                    {/* Modes */}
                    {mode === "en-to-vn" || mode === "vn-to-en" ? (
                      <>
                        <Input
                          ref={answerRef}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Your answer..."
                          className="max-w-md mx-auto mb-4"
                          disabled={answered}
                        />
                        {!answered ? (
                          <div className="flex gap-2 justify-center">
                            <Button onClick={checkInputAnswer}>Submit</Button>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <div
                              className={`font-bold ${
                                lastOutcome === "ok"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {lastOutcome === "ok"
                                ? "✅ Correct!"
                                : `❌ Incorrect. Correct answer: ${current[answerLang]}`}
                            </div>
                            <div className="flex gap-2 justify-center mt-3">
                              <Button onClick={handleNext}>Next (Enter)</Button>
                              <Button variant="outline" onClick={retryQuestion}>
                                Try Again (Esc)
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : mode === "quiz-en" || mode === "quiz-vn" ? (
                      <>
                        <div className="grid gap-2 max-w-xl mx-auto">
                          {choices.map((c) => (
                            <Button
                              key={c}
                              variant="outline"
                              className="justify-start"
                              disabled={answered}
                              onClick={() => chooseOption(c)}
                            >
                              {c}
                            </Button>
                          ))}
                        </div>
                        {answered && (
                          <div className="mt-3">
                            <div
                              className={`font-bold ${
                                lastOutcome === "ok"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {lastOutcome === "ok"
                                ? "✅ Correct!"
                                : `❌ Incorrect. Correct answer: ${correctChoice}`}
                            </div>
                            <div className="flex gap-2 justify-center mt-3">
                              <Button onClick={handleNext}>Next (Enter)</Button>
                              <Button variant="outline" onClick={retryQuestion}>
                                Try Again (Esc)
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* flashcard */
                      <>
                        <div className="border-2 border-dashed border-blue-500 dark:border-blue-400 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 inline-block min-w-[280px] shadow-sm">
                          <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                            {mode === "flash-en" ? current.en : current.vn}
                          </p>
                          {flashShown && (
                            <p className="text-lg mt-4 text-gray-700 dark:text-slate-200 border-t border-indigo-200 dark:border-slate-500 pt-4">
                              {mode === "flash-en" ? current.vn : current.en}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 justify-center mt-4">
                          {!flashShown ? (
                            <Button onClick={showFlashAnswer}>
                              Show Answer (Space)
                            </Button>
                          ) : (
                            <>
                              <Button onClick={flashKnow}>
                                I knew it (Enter)
                              </Button>
                              <Button variant="outline" onClick={flashAgain}>
                                I forgot (Esc)
                              </Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-slate-300 mt-8">
          Tip: Bấm{" "}
          <strong className="text-gray-800 dark:text-slate-200">Enter</strong>{" "}
          để nộp/tiếp •{" "}
          <strong className="text-gray-800 dark:text-slate-200">Esc</strong> để
          làm lại •{" "}
          <strong className="text-gray-800 dark:text-slate-200">Space</strong>{" "}
          để lật flashcard.
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hướng dẫn & Menu</CardTitle>
                <Button variant="ghost" onClick={() => setShowHelp(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-[220px_1fr] gap-6">
                <div className="space-y-2">
                  <Button
                    variant={
                      activeHelpSection === "guide" ? "default" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveHelpSection("guide")}
                  >
                    📘 Hướng dẫn nhanh
                  </Button>
                  <Button
                    variant={
                      activeHelpSection === "modes" ? "default" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveHelpSection("modes")}
                  >
                    🎯 Chế độ chơi
                  </Button>
                  <Button
                    variant={
                      activeHelpSection === "actions" ? "default" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveHelpSection("actions")}
                  >
                    ⚙️ Tác vụ nhanh
                  </Button>
                  <Button
                    variant={activeHelpSection === "faq" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveHelpSection("faq")}
                  >
                    ❓ Lưu ý/FAQ
                  </Button>
                </div>

                <div className="space-y-4">
                  {activeHelpSection === "guide" && (
                    <>
                      <h3 className="text-lg font-semibold">
                        1) Chuẩn bị Google Sheet
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>
                          Tạo Google Sheet với cột A tiêu đề <strong>en</strong>
                          , cột B tiêu đề <strong>vn</strong>
                        </li>
                        <li>
                          Mở sheet → <strong>Share</strong> → bật{" "}
                          <strong>Anyone with the link → Viewer</strong>
                        </li>
                        <li>Copy link của Google Sheet</li>
                      </ol>
                      <h3 className="text-lg font-semibold">
                        2) Dán link vào web
                      </h3>
                      <p className="text-sm">
                        Dán link và bấm <strong>Lưu link</strong>. Link sẽ được
                        lưu vào trình duyệt.
                      </p>
                      <h3 className="text-lg font-semibold">
                        3) Định dạng sheet
                      </h3>
                      <p className="text-sm">
                        <b>
                          - Có thể bỏ qua bước này nếu không có định dạng khác
                          text như số, tỉ lệ % hay ngày tháng... trong sheet
                        </b>
                      </p>
                      <p className="text-sm">
                        1. Nhấn Ctrl + A (2 lần) để chọn toàn bộ ô trong sheet.
                      </p>
                      <p className="text-sm">
                        2. Vào Format → Number → Plain text (Định dạng → Số →
                        Văn bản thuần túy).
                      </p>
                      <h3 className="text-lg font-semibold">4) Bắt đầu chơi</h3>
                      <p className="text-sm">
                        Chọn chế độ EN/VN, Quiz hoặc Flashcard. Dữ liệu cập nhật
                        trực tiếp từ Sheet.
                      </p>
                    </>
                  )}
                  {activeHelpSection === "modes" && (
                    <>
                      <h3 className="text-lg font-semibold">Chế độ chơi</h3>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>✍️ EN → VN</strong>: Nhập nghĩa tiếng Việt cho
                          từ tiếng Anh
                        </li>
                        <li>
                          <strong>✍️ VN → EN</strong>: Nhập nghĩa tiếng Anh cho
                          từ tiếng Việt
                        </li>
                        <li>
                          <strong>✅ Quiz</strong>: Trắc nghiệm với các lựa chọn
                        </li>
                        <li>
                          <strong>🪪 Flashcard</strong>: Lật thẻ để xem nghĩa
                        </li>
                      </ul>
                    </>
                  )}
                  {activeHelpSection === "actions" && (
                    <>
                      <h3 className="text-lg font-semibold">Tác vụ nhanh</h3>
                      <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => setIsCollapsed(false)}>
                          📄 Mở khung dán link
                        </Button>
                        <Button variant="outline" onClick={reloadFromSaved}>
                          🔄 Tải lại dữ liệu
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }
                        >
                          ⬆️ Lên đầu trang
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Bạn có thể quản lý link Sheet trong phần Google Sheet
                        phía trên.
                      </p>
                    </>
                  )}
                  {activeHelpSection === "faq" && (
                    <>
                      <h3 className="text-lg font-semibold">Lưu ý/FAQ</h3>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>Định dạng dữ liệu:</strong> Cột A = EN, Cột B
                          = VN
                        </li>
                        <li>
                          <strong>Dòng trống:</strong> Nên tránh dòng trống giữa
                          dữ liệu
                        </li>
                        <li>
                          <strong>Lưu cục bộ:</strong> Link được lưu ở trình
                          duyệt
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
