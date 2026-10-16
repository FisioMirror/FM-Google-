import os, re

ui_dir = 'src/components/ui'
sub_suffixes = (
    'Props', 'Type', 'Context', 'Demo', 'Item', 'Trigger', 'Backdrop',
    'Container', 'Dialog', 'CloseTrigger', 'Header', 'Icon', 'Heading',
    'Body', 'Footer', 'Indicator', 'Content', 'Title', 'Description',
    'Cell', 'Grid', 'GridHeader', 'GridBody', 'NavButton', 'HeaderCell',
    'Popover', 'Value', 'Label', 'StatusesDemo', 'PreferencesDemo'
)

files = [f for f in os.listdir(ui_dir) if f.endswith(('.tsx', '.ts'))]
all_comps = {}
for f in files:
    with open(os.path.join(ui_dir, f)) as fl:
        text = fl.read()
    matches = re.findall(r'export\s+(?:const|function)\s+([A-Z][A-Za-z0-9]+)', text)
    for m in matches:
        if not any(m.endswith(s) for s in sub_suffixes):
            all_comps[m] = f

ops = [
    'src/pages/DashboardFisio.tsx', 'src/pages/PatientDashboard.tsx', 'src/pages/ARMirrorPage.tsx',
    'src/pages/ExercisesPage.tsx', 'src/pages/PatientExercisesPage.tsx', 'src/pages/PatientsPage.tsx',
    'src/pages/PatientDetailPage.tsx', 'src/pages/StatsPage.tsx', 'src/pages/ToolsPage.tsx',
    'src/pages/CalibrationPage.tsx', 'src/pages/ProfilePage.tsx', 'src/pages/SettingsPage.tsx',
    'src/pages/Login.tsx', 'src/pages/AIAssistantPage.tsx', 'src/pages/OCRScannerPage.tsx',
    'src/pages/TokenGeneratorPage.tsx', 'src/pages/RegistroPacientePage.tsx',
    'src/components/FisioLayout.tsx', 'src/components/PatientLayout.tsx',
    'src/components/ui/ExerciseImage.tsx', 'src/components/ui/EmailFeatureModal.tsx'
]

op_texts = []
for p in ops:
    if os.path.exists(p):
        with open(p) as f:
            op_texts.append(f.read())
op_combined = "\n".join(op_texts)

with open('src/pages/UIShowcasePage.tsx') as f:
    sc = f.read()

unimplemented = []
for c, f in sorted(all_comps.items()):
    in_sc = bool(re.search(r'\b' + c + r'\b', sc))
    in_op = bool(re.search(r'\b' + c + r'\b', op_combined))
    if not in_op:
        unimplemented.append((c, f, in_sc))

print(f"Total standalone components: {len(all_comps)}")
print(f"Unimplemented in operational pages: {len(unimplemented)}")
for c, f, in_sc in unimplemented:
    print(f"  * {c} -> file: {f} (in UIShowcasePage: {in_sc})")
