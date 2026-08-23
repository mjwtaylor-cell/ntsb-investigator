import { DocketShell } from './ui/shell/DocketShell';
import { SeedEntry } from './ui/modes/SeedEntry';
import { useCaseStore } from './ui/store/caseStore';

export function App() {
  const seed = useCaseStore((s) => s.seed);
  if (!seed) return <SeedEntry />;
  return <DocketShell />;
}
