import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

interface Book {
  title: string;
  author?: string;
  cover?: string;
  intro?: string;
  category?: string;
  publisher?: string;
  readTimeText: string;
}

interface Category {
  categoryTitle: string;
  readingCount: number;
  readingTime: number;
}

interface Author {
  name: string;
  count: number;
  readTime: string;
}

interface ReadDataSummary {
  readDays: number;
  totalReadTimeText: string;
  dayAverageReadTimeText: string;
  topBooks: Book[];
  stats?: Array<{
    stat: string;
    counts: string;
  }>;
  preferences?: {
    categoryWord?: string;
    timeWord?: string;
    categories?: Category[];
    authors?: Author[];
  };
}

type ModeKey = 'weekly' | 'monthly' | 'annually' | 'overall';

interface WereadPayload {
  updatedAt?: string;
  data?: Partial<Record<ModeKey, ReadDataSummary | null>>;
}

const modeOptions: Array<{ key: ModeKey; label: string }> = [
  { key: 'weekly', label: '本周' },
  { key: 'monthly', label: '本月' },
  { key: 'annually', label: '今年' },
  { key: 'overall', label: '累计' },
];

function getUpdatedText(value?: string) {
  if (!value) return '';

  const updatedAt = new Date(value);
  if (Number.isNaN(updatedAt.getTime())) return '';

  return `${updatedAt.getFullYear()}.${updatedAt.getMonth() + 1}.${updatedAt.getDate()}`;
}

function ReadingSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-7 pb-36 sm:px-6 sm:py-14 sm:pb-28">
      <header className="flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center gap-3 text-[#38A8FF]">
          <Icon icon="tabler:books" className="size-7" />
          <span className="text-sm font-medium">微信读书</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">阅读</h1>
          <p className="mt-3 text-sm text-zinc-500 sm:text-base dark:text-zinc-400">正在同步阅读数据。</p>
        </div>
      </header>
    </main>
  );
}

export default function ReadingStats() {
  const [payload, setPayload] = useState<WereadPayload | null>(null);
  const [activeMode, setActiveMode] = useState<ModeKey>('annually');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    fetch('/api/weread/readdata')
      .then((response) => {
        if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
        return response.json() as Promise<WereadPayload>;
      })
      .then((data) => {
        if (!mounted) return;
        const availableModes = modeOptions.filter((mode) => data.data?.[mode.key]);
        setPayload(data);
        setActiveMode((availableModes.find((mode) => mode.key === 'annually') ?? availableModes[0])?.key ?? 'annually');
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to load WeRead data', err);
        setError('阅读数据暂时不可用。');
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-7 pb-36 sm:px-6 sm:py-14 sm:pb-28">
        <header className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-center gap-3 text-[#38A8FF]">
            <Icon icon="tabler:books" className="size-7" />
            <span className="text-sm font-medium">微信读书</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">阅读</h1>
            <p className="mt-3 text-sm text-zinc-500 sm:text-base dark:text-zinc-400">{error}</p>
          </div>
        </header>
      </main>
    );
  }

  if (!payload) return <ReadingSkeleton />;

  const availableModes = modeOptions
    .map((mode) => ({
      ...mode,
      summary: payload.data?.[mode.key],
    }))
    .filter((mode): mode is { key: ModeKey; label: string; summary: ReadDataSummary } => Boolean(mode.summary));
  const activeSummary = availableModes.find((mode) => mode.key === activeMode)?.summary;
  const activeLabel = availableModes.find((mode) => mode.key === activeMode)?.label ?? '';
  const updatedText = getUpdatedText(payload.updatedAt);

  if (!activeSummary) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-7 pb-36 sm:px-6 sm:py-14 sm:pb-28">
        <header className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-center gap-3 text-[#38A8FF]">
            <Icon icon="tabler:books" className="size-7" />
            <span className="text-sm font-medium">微信读书</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">阅读</h1>
            <p className="mt-3 text-sm text-zinc-500 sm:text-base dark:text-zinc-400">暂无阅读数据。</p>
          </div>
        </header>
      </main>
    );
  }

  const books = activeSummary.topBooks?.slice(0, 7) ?? [];
  const primaryBook = books[0];
  const restBooks = books.slice(1);
  const categories =
    activeSummary.preferences?.categories?.filter((category) => category.readingTime > 0).slice(0, 5) ?? [];
  const authors = activeSummary.preferences?.authors?.slice(0, 5) ?? [];
  const stats = activeSummary.stats ?? [];
  const hasAside =
    stats.length > 0 ||
    categories.length > 0 ||
    Boolean(activeSummary.preferences?.categoryWord) ||
    authors.length > 0 ||
    Boolean(activeSummary.preferences?.timeWord);

  return (
    <main className="mx-auto max-w-4xl px-4 py-7 pb-36 sm:px-6 sm:py-14 sm:pb-28">
      <header className="flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center gap-3 text-[#38A8FF]">
          <Icon icon="tabler:books" className="size-7" />
          <span className="text-sm font-medium">微信读书</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">阅读</h1>
            <p className="mt-3 text-sm text-zinc-500 sm:text-base dark:text-zinc-400">
              {activeLabel}读了 {activeSummary.totalReadTimeText ?? '0分钟'}，共 {activeSummary.readDays ?? 0} 天。
            </p>
          </div>
          {updatedText && <p className="text-xs text-zinc-400 dark:text-zinc-500">更新于 {updatedText}</p>}
        </div>

        {availableModes.length > 1 && (
          <div className="grid w-full grid-cols-4 rounded-full border border-zinc-100 bg-zinc-50 p-1 sm:inline-flex sm:w-fit dark:border-white/10 dark:bg-white/3">
            {availableModes.map((mode) => (
              <button
                key={mode.key}
                type="button"
                aria-pressed={mode.key === activeMode}
                onClick={() => setActiveMode(mode.key)}
                className="rounded-full px-3 py-2 text-sm font-medium text-zinc-500 transition-colors aria-pressed:bg-white aria-pressed:text-zinc-900 aria-pressed:shadow-sm sm:px-4 dark:text-zinc-400 dark:aria-pressed:bg-white/10 dark:aria-pressed:text-zinc-50"
              >
                {mode.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="mt-8 sm:mt-12">
        <section className="flex flex-col gap-7 sm:gap-10">
          {primaryBook && (
            <article className="grid gap-5 sm:grid-cols-[14rem_minmax(0,1fr)] sm:items-start sm:gap-10">
              {primaryBook.cover && (
                <div className="mx-auto flex h-48 w-32 items-center justify-center sm:mx-0 sm:h-80 sm:w-56">
                  <img
                    src={primaryBook.cover}
                    alt=""
                    loading="lazy"
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                </div>
              )}

              <div className="min-w-0 pt-1">
                <p className="text-xs font-medium text-[#38A8FF]">{activeLabel}读得最多</p>
                <h2 className="wrap-break-word mt-3 text-2xl font-semibold leading-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                  {primaryBook.title}
                </h2>
                {primaryBook.author && (
                  <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{primaryBook.author}</p>
                )}
                {primaryBook.category && (
                  <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
                    {[primaryBook.category, primaryBook.publisher].filter(Boolean).join(' · ')}
                  </p>
                )}
                {primaryBook.intro && (
                  <p className="mt-5 line-clamp-3 text-sm leading-7 text-zinc-500 sm:line-clamp-5 dark:text-zinc-400">
                    {primaryBook.intro.trim()}
                  </p>
                )}
              </div>
            </article>
          )}

          <section className="grid items-start gap-7 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
            <div className="min-w-0">
              {restBooks.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">继续看的书</h2>
                  <div className="mt-4 divide-y divide-zinc-100 dark:divide-white/10">
                    {restBooks.map((book, index) => (
                      <article
                        key={`${book.title}-${book.author ?? ''}-${book.cover ?? ''}`}
                        className="grid grid-cols-[1.25rem_3rem_minmax(0,1fr)] gap-3 py-4 sm:flex sm:items-start sm:gap-4"
                      >
                        <span className="w-5 pt-1 text-xs text-zinc-300 dark:text-zinc-600">{index + 2}</span>
                        {book.cover && (
                          <div className="flex h-16 w-12 shrink-0 items-center justify-center">
                            <img
                              src={book.cover}
                              alt=""
                              loading="lazy"
                              className="max-h-full max-w-full rounded object-contain"
                            />
                          </div>
                        )}
                        <div className="min-w-0 sm:flex-1">
                          <h3 className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">{book.title}</h3>
                          <p className="mt-1 truncate text-xs text-zinc-400 dark:text-zinc-500">
                            {[book.author, book.category].filter(Boolean).join(' · ') || '未知作者'}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 sm:hidden dark:text-zinc-400">{book.readTimeText}</p>
                        </div>
                        <span className="hidden shrink-0 text-xs text-zinc-500 sm:block dark:text-zinc-400">
                          {book.readTimeText}
                        </span>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {hasAside && (
              <aside className="min-w-0 space-y-7 border-t border-zinc-100 pt-7 sm:space-y-8 lg:sticky lg:top-24 lg:border-t-0 lg:pt-0 dark:border-white/10">
                {stats.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{activeLabel}概览</h2>
                    <div className="mt-4 space-y-4">
                      {stats.map((item) => (
                        <div key={item.stat} className="flex items-baseline justify-between gap-4">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">{item.stat}</span>
                          <span className="shrink-0 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                            {item.counts}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(categories.length > 0 || activeSummary.preferences?.categoryWord) && (
                  <section>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">偏好</h2>
                    {categories.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <span
                            key={category.categoryTitle}
                            className="max-w-full truncate rounded-full border border-zinc-100 px-3 py-1.5 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-300"
                          >
                            {category.categoryTitle} · {category.readingCount} 本
                          </span>
                        ))}
                      </div>
                    )}
                    {activeSummary.preferences?.categoryWord && (
                      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {activeSummary.preferences.categoryWord}
                      </p>
                    )}
                  </section>
                )}

                {(authors.length > 0 || activeSummary.preferences?.timeWord) && (
                  <section>
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">作者</h2>
                    {authors.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {authors.map((author) => (
                          <div key={author.name} className="flex items-baseline justify-between gap-4">
                            <span className="truncate text-sm text-zinc-600 dark:text-zinc-300">{author.name}</span>
                            <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                              {author.count} 本 · {author.readTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeSummary.preferences?.timeWord && (
                      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {activeSummary.preferences.timeWord}
                      </p>
                    )}
                  </section>
                )}
              </aside>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
