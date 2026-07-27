const DEFAULT_SETTINGS = {
  showLineNumbers: true,
  useBlackCodeBackground: false,
  showHighlightStepIndicator: true,
  fontSize: 24,
  lineHeight: 1.5,
  editorFontSize: 14,
  useGlobalTransition: false,
  globalTransitionDuration: 300,
  useGlobalStagger: false,
  globalStagger: 0,
  useGlobalHighlight: true,
  globalDimAmount: 75,
  globalSizeUpAmount: 125,
  highlightDimColor: "theme",
  currentSlideId: "project-1-slide-1",
  language: "javascript",
  codeAlign: "left",
};

const PROJECT = {
  id: "project-1",
  name: "Benchmark Deck",
  theme: "dark-plus",
  settings: DEFAULT_SETTINGS,
  slides: [
    {
      id: "project-1-slide-1",
      name: "Variables",
      code: "const framework = 'OpenSlides';\nconsole.log(framework);",
      language: "javascript",
      duration: 3000,
      transitionDuration: 300,
      stagger: 0,
      highlights: [
        {
          id: "highlight-1",
          startLine: 0,
          startChar: 0,
          endLine: 0,
          endChar: 35,
          dimAmount: 75,
          sizeUpEnabled: false,
          sizeUpAmount: 125,
          useCustomTransition: false,
          dimTransition: 500,
          sizeUpTransition: 600,
        },
      ],
    },
    {
      id: "project-1-slide-2",
      name: "Output",
      code: "export const parity = true;",
      language: "javascript",
      duration: 3000,
      transitionDuration: 300,
      stagger: 0,
      highlights: [],
    },
  ],
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
};

const SECOND_PROJECT = {
  ...PROJECT,
  id: "project-2",
  name: "Reference Deck",
  settings: {
    ...DEFAULT_SETTINGS,
    currentSlideId: "project-2-slide-1",
  },
  slides: PROJECT.slides.map((slide, index) => ({
    ...slide,
    id: `project-2-slide-${index + 1}`,
    highlights: slide.highlights.map((highlight) => ({
      ...highlight,
      id: `project-2-${highlight.id}`,
    })),
  })),
  createdAt: 1_700_000_100_000,
  updatedAt: 1_700_000_100_000,
};

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "rust", label: "Rust" },
];

const THEMES = [
  {
    value: "dark-plus",
    label: "Dark Plus",
    type: "dark",
    background: "#1e1e1e",
    foreground: "#d4d4d4",
  },
  {
    value: "github-light",
    label: "GitHub Light",
    type: "light",
    background: "#ffffff",
    foreground: "#24292f",
  },
];

export async function installOpenSlidesBackend(page, options = {}) {
  const projects = [PROJECT, SECOND_PROJECT].map((project, index) => ({
    ...structuredClone(project),
    groupId: options.stacked ? "group-playwright" : null,
    groupOrder: options.stacked ? index : undefined,
    slides: project.slides.map((slide) => ({
      ...structuredClone(slide),
      duration: options.autoplayDuration ?? slide.duration,
    })),
  }));
  for (let index = 2; index < (options.projectCount ?? 2); index += 1) {
    const source = index % 2 === 0 ? PROJECT : SECOND_PROJECT;
    projects.push({
      ...structuredClone(source),
      id: `project-${index + 1}`,
      name: `Generated Deck ${String(index + 1).padStart(3, "0")}`,
      settings: {
        ...structuredClone(source.settings),
        currentSlideId: `project-${index + 1}-slide-1`,
      },
      slides: source.slides.map((slide, slideIndex) => ({
        ...structuredClone(slide),
        id: `project-${index + 1}-slide-${slideIndex + 1}`,
        duration: options.autoplayDuration ?? slide.duration,
      })),
      groupId: null,
      groupOrder: undefined,
    });
  }
  await page.addInitScript(
    ({ defaultSettings, importProject, seedProjects, languages, themes }) => {
      const clone = (value) => {
        try {
          return structuredClone(value);
        } catch {
          // Vue reactive proxies are JSON-serializable through Tauri IPC but
          // cannot be passed directly to structuredClone in the browser mock.
          return JSON.parse(JSON.stringify(value));
        }
      };
      const projects = new Map(
        seedProjects.map((project) => [project.id, clone(project)]),
      );
      const callbacks = new Map();
      const listeners = new Map();
      const calls = [];
      let callbackId = 1;
      let resourceId = 1;
      let sequence = seedProjects.length;
      let fullscreen = false;

      const summarize = (item) => ({
        id: item.id,
        name: item.name,
        theme: item.theme,
        slideCount: item.slides.length,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        language: item.settings.language,
        firstSlideId: item.slides[0]?.id ?? "",
        firstSlideCode: item.slides[0]?.code ?? "",
        firstSlideThumbnail: item.slides[0]?.thumbnailHtml ?? "",
        groupId: item.groupId ?? null,
        groupOrder: item.groupOrder,
      });

      const mustProject = (projectId) => {
        const item = projects.get(projectId);
        if (!item) throw new Error(`Playwright backend: unknown project ${projectId}`);
        return item;
      };

      const findSlide = (slideId) => {
        for (const item of projects.values()) {
          const slide = item.slides.find((entry) => entry.id === slideId);
          if (slide) return { project: item, slide };
        }
        throw new Error(`Playwright backend: unknown slide ${slideId}`);
      };

      const runCallback = (id, payload) => callbacks.get(id)?.(payload);

      const invoke = async (command, args = {}) => {
        if (
          !command.startsWith("plugin:") ||
          command.startsWith("plugin:window|")
        ) {
          calls.push({ command, args: clone(args) });
        }
        if (command === "plugin:event|listen") {
          const eventListeners = listeners.get(args.event) ?? [];
          eventListeners.push(args.handler);
          listeners.set(args.event, eventListeners);
          return args.handler;
        }
        if (command === "plugin:event|unlisten") {
          const eventListeners = listeners.get(args.event) ?? [];
          listeners.set(
            args.event,
            eventListeners.filter((id) => id !== args.eventId),
          );
          return null;
        }
        if (command === "plugin:event|emit") {
          for (const id of listeners.get(args.event) ?? []) {
            runCallback(id, {
              event: args.event,
              id,
              payload: args.payload,
            });
          }
          return null;
        }
        if (command === "plugin:menu|new") {
          const id =
            args.options?.id ??
            args.options?.text ??
            `playwright-menu-${resourceId}`;
          return [resourceId++, id];
        }
        if (command.startsWith("plugin:menu|")) return null;
        if (command === "plugin:window|is_fullscreen") return fullscreen;
        if (command === "plugin:window|set_fullscreen") {
          fullscreen = Boolean(args.value);
          return null;
        }
        if (command.startsWith("plugin:window|")) return null;

        switch (command) {
          case "get_projects":
            return [...projects.values()].map(summarize);
          case "get_project":
            return clone(mustProject(args.projectId));
          case "get_default_settings":
            return clone(defaultSettings);
          case "get_supported_languages":
            return clone(languages);
          case "get_supported_themes":
            return clone(themes);
          case "create_project": {
            const id = `project-${++sequence}`;
            const item = {
              id,
              name: args.name,
              theme: "dark-plus",
              settings: clone(defaultSettings),
              slides: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            projects.set(id, item);
            return clone(item);
          }
          case "rename_project": {
            const item = mustProject(args.projectId);
            item.name = args.name;
            item.updatedAt = Date.now();
            return clone(item);
          }
          case "duplicate_project": {
            const source = mustProject(args.projectId);
            const item = clone(source);
            item.id = `project-${++sequence}`;
            item.name = `${source.name} copy`;
            projects.set(item.id, item);
            return clone(item);
          }
          case "delete_project":
            projects.delete(args.projectId);
            return null;
          case "update_project_settings": {
            const item = mustProject(args.projectId);
            item.settings = { ...item.settings, ...args.settings };
            return clone(item);
          }
          case "update_project_theme": {
            const item = mustProject(args.projectId);
            item.theme = args.theme;
            return clone(item);
          }
          case "create_slide": {
            const payload = args.payload ?? {};
            const item = mustProject(payload.projectId);
            const slide = {
              id: `slide-${++sequence}`,
              name: payload.name ?? "",
              code: payload.code ?? "",
              language: item.settings.language,
              duration: 3000,
              transitionDuration: 300,
              stagger: 0,
              highlights: [],
            };
            item.slides.push(slide);
            return clone(slide);
          }
          case "delete_slide": {
            const item = mustProject(args.projectId);
            item.slides = item.slides.filter((slide) => slide.id !== args.slideId);
            return clone(item);
          }
          case "duplicate_slide": {
            const item = mustProject(args.projectId);
            const index = item.slides.findIndex((slide) => slide.id === args.slideId);
            const slide = {
              ...clone(item.slides[index]),
              id: `slide-${++sequence}`,
            };
            item.slides.splice(index + 1, 0, slide);
            return clone(item);
          }
          case "restore_slide": {
            const item = mustProject(args.projectId);
            item.slides.splice(args.insertAt ?? item.slides.length, 0, clone(args.slide));
            return clone(item);
          }
          case "update_slide_code":
            findSlide(args.slideId).slide.code = args.code;
            return null;
          case "cache_thumbnail":
            return null;
          case "update_slide_settings": {
            const { slide } = findSlide(args.slideId);
            Object.assign(slide, args.payload);
            return clone(slide);
          }
          case "reorder_slides": {
            const item = mustProject(args.projectId);
            const order = new Map(
              args.slideIds.map((slideId, index) => [slideId, index]),
            );
            item.slides.sort(
              (left, right) => order.get(left.id) - order.get(right.id),
            );
            return clone(item);
          }
          case "set_current_slide": {
            const item = mustProject(args.projectId);
            item.settings.currentSlideId = args.slideId;
            return null;
          }
          case "export_project_to_json":
            mustProject(args.projectId);
            return "/tmp/benchmark-deck.openslides.json";
          case "import_project_from_json": {
            const item = clone(importProject);
            item.id = `project-${++sequence}`;
            item.name = "Imported Presentation";
            item.slides = item.slides.map((slide, index) => ({
              ...slide,
              id: `${item.id}-slide-${index + 1}`,
            }));
            item.settings.currentSlideId = item.slides[0]?.id ?? null;
            projects.set(item.id, item);
            return clone(item);
          }
          case "search_slides": {
            const item = mustProject(args.projectId);
            const query = String(args.query ?? "").toLowerCase();
            return item.slides
              .filter(
                (slide) =>
                  slide.name?.toLowerCase().includes(query) ||
                  slide.code.toLowerCase().includes(query),
              )
              .map((slide) => slide.id);
          }
          case "stack_projects": {
            const target = mustProject(args.targetId);
            const groupId = target.groupId ?? `group-${++sequence}`;
            const ids = [...args.sourceIds, args.targetId];
            ids.forEach((id, index) => {
              const item = mustProject(id);
              item.groupId = groupId;
              item.groupOrder = index;
            });
            return [...projects.values()].map(summarize);
          }
          case "unstack_projects":
            for (const id of args.projectIds) {
              const item = mustProject(id);
              item.groupId = null;
              item.groupOrder = undefined;
            }
            return [...projects.values()].map(summarize);
          case "stack_slides": {
            const item = mustProject(args.projectId);
            const target = item.slides.find(
              (slide) => slide.id === args.targetId,
            );
            if (!target) throw new Error("Playwright backend: stack target missing");
            const sectionId = target.sectionId ?? `section-${++sequence}`;
            const ids = new Set([...args.sourceIds, args.targetId]);
            item.slides.forEach((slide) => {
              if (ids.has(slide.id)) slide.sectionId = sectionId;
            });
            return clone(item.slides);
          }
          case "unstack_slides": {
            const item = mustProject(args.projectId);
            const ids = new Set(args.slideIds);
            item.slides.forEach((slide) => {
              if (ids.has(slide.id)) slide.sectionId = null;
            });
            return clone(mustProject(args.projectId).slides);
          }
          case "finish_quit":
            return null;
          default:
            throw new Error(`Playwright backend: unhandled Tauri command ${command}`);
        }
      };

      window.__TAURI_INTERNALS__ = {
        callbacks,
        convertFileSrc: (path) => path,
        invoke,
        metadata: {
          currentWindow: { label: "main" },
          currentWebview: { label: "main", windowLabel: "main" },
        },
        runCallback,
        transformCallback(callback, once = false) {
          const id = callbackId++;
          callbacks.set(id, (payload) => {
            if (once) callbacks.delete(id);
            return callback?.(payload);
          });
          return id;
        },
        unregisterCallback(id) {
          callbacks.delete(id);
        },
      };
      window.__TAURI_EVENT_PLUGIN_INTERNALS__ = {
        unregisterListener(_event, id) {
          callbacks.delete(id);
        },
      };
      window.__OPENSLIDES_E2E__ = {
        calls,
        emit(event, payload) {
          for (const id of listeners.get(event) ?? []) {
            runCallback(id, { event, id, payload });
          }
        },
        snapshot() {
          return clone([...projects.values()]);
        },
      };
    },
    {
      defaultSettings: DEFAULT_SETTINGS,
      importProject: PROJECT,
      seedProjects: projects,
      languages: LANGUAGES,
      themes: THEMES,
    },
  );
}
