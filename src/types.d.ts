export type Build = {
  path: string;
  splash?: string | null;
  open: boolean;
  enabled: boolean;
  excluded?: boolean;
  version: string;
  netcl?: string;
  season: string;
  loading?: boolean;
  shipping?: string;
  title?: string;
};

export type BuildState = {
  entries: Map<string, Build>;
  add: (key: string, value: Build) => void;
  delete: (key: string) => void;
  wipe: () => void;
  patch: (key: string, patch: Partial<Build>) => void;
};

export type User = {
  displayName: string;
  email: string;
  password?: string;
  accountId: string;
  accessToken: string;
};

export type UserState = {
  user: User | null;
  displayName: string;
  email: string;
  password?: string;
  accountId: string;
  accessToken: string;

  login: (user: User) => void;
  logout: () => void;
  patch: (patch: Partial<User>) => void;
};

export type CosmeticItem = {
  id: string;
  name: string;
  description: string;
  type: {
    value: string;
    displayValue: string;
  };
  images: {
    smallIcon: string;
    icon: string;
  };
  rarity: {
    value: string;
    displayValue: string;
  };
};

export type View = "home" | "library" | "shop" | "settings";

export type SidebarPosition = "left" | "top" | "right" | "bottom";

export type ConfigState = {
  minimizeOnLaunch: boolean;
  minimizeSidebar: boolean;
  theme: string;
  sidebarPosition: SidebarPosition;
  sidebarSize: number;
  frameHeight: number;
  highPriorityLaunch: boolean;
  adminLaunch: boolean;
  closeGameOnLauncherExit: boolean;

  editOnRelease: boolean;
  eorEnabled: boolean;
  rorEnabled: boolean;
  editAndRelease: boolean;
  resetOnRelease: boolean;
  alwaysOnTop: boolean;
  lowUsageMode: boolean;
  snowParticles: boolean;
  mobileBuilds: boolean;

  setEorEnabled: (value: boolean) => void;
  setRorEnabled: (value: boolean) => void;
  setLowUsageMode: (value: boolean) => void;
  setResetOnRelease: (value: boolean) => void;
  setEditAndRelease: (value: boolean) => void;
  setEditOnRelease: (value: boolean) => void;
  setAlwaysOnTop: (value: boolean) => void;
  setSnowParticles: (value: boolean) => void;
  setMinimizeSidebar: (value: boolean) => void;
  setMinimizeOnLaunch: (value: boolean) => void;
  setSidebarPosition: (pos: SidebarPosition) => void;
  setSidebarSize: (size: number) => void;
  setFrameHeight: (height: number) => void;
  setHighPriorityLaunch: (value: boolean) => void;
  setAdminLaunch: (value: boolean) => void;
  setCloseGameOnLauncherExit: (value: boolean) => void;
  toggleMinimizeOnLaunch: () => void;
  setTheme: (theme: string) => void;
  setMobileBuilds: (value: boolean) => void;
};

export type Theme = {
  background: {
    primary: string;
    secondary: string;
  };

  text: {
    primary: string;
    secondary: string;
  };

  button: {
    base: string;
    hover: string;
    active: string;
  };

  border: string;

  gradient: {
    from: string;
    to: string;
  };
};

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: {
    featured?: string;
    icon: string;
  };
  rarity: {
    value: string;
    displayValue: string;
  };
};

export type ContentPagesResult = {
  [key: string]: any;
};

export type Profile = {
  accountId: string | null;
  accessToken: string;
  displayName: string | null;
  email: string | null;
  password?: string | null;
  hydrated: boolean;
  setHydrated: () => void;
  setProfile: (user: any) => void;
  clearProfile: () => void;
  login: (user: { accountId: string; accessToken: string; displayName: string; email: string; password?: string }) => void;
  logout: () => void;
};
