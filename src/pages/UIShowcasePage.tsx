import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Copy, 
  Heart, 
  ArrowLeft, 
  Zap, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  Sliders,
  Eye,
  RefreshCw,
  Search,
  ArrowRight,
  MousePointer,
  CheckCircle2,
  Calendar,
  BarChart3,
  ListTodo,
  Bell,
  AlertTriangle,
  UserCheck,
  Megaphone,
  CheckSquare,
  Tag,
  Radio,
  Home,
  Users,
  Camera,
  Dumbbell
} from 'lucide-react';
import { Button, IconButton, BackButton } from '../components/ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, ConfirmDialog } from '../components/ui/Dialog';
import { Card, StatCard } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { OtpInput } from '../components/ui/OtpInput';
import { Tooltip } from '../components/ui/Tooltip';
import { CardSpotlight } from '../components/ui/CardSpotlight';
import { BorderBeam } from '../components/ui/BorderBeam';
import { NumberTicker } from '../components/ui/NumberTicker';
import { ShimmerButton } from '../components/ui/ShimmerButton';
import { ClinicalSlider } from '../components/ui/ClinicalSlider';
import { AuroraText } from '../components/ui/AuroraText';
import { ShimmerText } from '../components/ui/ShimmerText';

// 8 Componentes Solicitados Previos
import { IncidentReportCard } from '../components/ui/IncidentReportCard';
import { AssignmentProgressCard, type RoutineCardData } from '../components/ui/AssignmentProgressCard';
import { BasicAlertsDemo } from '../components/ui/HeroAlert';
import { DeleteProjectDialogDemo } from '../components/ui/HeroAlertDialog';
import { AvatarDemo } from '../components/ui/HeroAvatar';
import { PromoCardDemo } from '../components/ui/HeroPromoCard';
import { CheckboxPreferencesDemo } from '../components/ui/HeroCheckbox';
import { ChipStatusesDemo } from '../components/ui/HeroChip';

// 4 Componentes de Suite Reciente (Modal, Popover, Drawer, DateRangePicker)
import { CustomModalDemo } from '../components/ui/Modal';
import { PopoverMetricDemo } from '../components/ui/Popover';
import { DrawerClinicalDemo } from '../components/ui/Drawer';
import { 
  DateRangePickerDemo, 
  BasicRangeCalendar, 
  WeekViewRangeCalendar, 
  DefaultValueRangeCalendar 
} from '../components/ui/DateRangePicker';

// Nuevos componentes estandarizados: ScrollShadow, Skeleton, Toast, AnimatedList, Confetti
import { ScrollShadow } from '../components/ui/ScrollShadow';
import { Skeleton } from '../components/ui/Skeleton';
import { toast } from '../components/ui/Toast';
import { ClinicalActivityFeed } from '../components/ui/ClinicalActivityFeed';
import { ConfettiStars, ConfettiSideCannons } from '../components/ui/ConfettiButton';

// Nuevos 7 Componentes Avanzados
import { Highlighter, ClinicalHighlighter, type AnnotationAction } from '../components/ui/Highlighter';
import { InteractiveHoverButton } from '../components/ui/InteractiveHoverButton';
import { KineticText } from '../components/ui/KineticText';
import { LightRays } from '../components/ui/LightRays';
import { MagicCard } from '../components/ui/MagicCard';
import { PixelImage } from '../components/ui/PixelImage';

// 6 Componentes de Nueva Suite (PulsatingButton, ScrollProgress, ShineBorder, SparklesText, TextAnimate)
import { PulsatingButton } from '../components/ui/PulsatingButton';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { ShineBorder } from '../components/ui/ShineBorder';
import { SparklesText } from '../components/ui/SparklesText';
import { TextAnimate, type AnimationType, type AnimationVariant } from '../components/ui/TextAnimate';

// 8 Nuevos Componentes Estelares Biomecánicos & Gamificación FisioMirror
import { BiomechanicalAngleGauge } from '../components/ui/BiomechanicalAngleGauge';
import { ARFloatingDock } from '../components/ui/ARFloatingDock';
import { RehabEnergyBar } from '../components/ui/RehabEnergyBar';
import { GamifiedBadgeCard } from '../components/ui/GamifiedBadgeCard';
import { CompensationAlertBanner } from '../components/ui/CompensationAlertBanner';
import { RepetitionCounterSpring } from '../components/ui/RepetitionCounterSpring';
import { JointDetailPopover } from '../components/ui/JointDetailPopover';
import { TherapistQuickToolbar } from '../components/ui/TherapistQuickToolbar';

// 50 Componentes Nuevos de la Macro Suite FisioMirror (5 Categorías)
import * as MegaSuite from '../components/ui/megaSuite';

// Armonización y Tokens Pastel Clínicos
import { HarmonizedSurface } from '../components/ui/HarmonizedSurface';
import { CLINICAL_PASTELS } from '../lib/designTokens';

// PWA Móvil & Físicas de Resorte
import { MobileBottomSheet, type BottomSheetSnapPoint } from '../components/ui/MobileBottomSheet';
import { 
  CompactJointSelector, 
  CompactRomStepper, 
  CompactToleranceDropdown 
} from '../components/ui/CompactQuickSelector';
import { MotionBlurFade, TactileFeedback } from '../components/ui/MotionWrappers';

import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

type FilterTab = 'todos' | 'megasuite' | 'mobile' | 'armonizacion' | 'estelar' | 'solicitados' | 'comparativa' | 'botones' | 'tarjetas' | 'modales' | 'entradas' | 'clinicos' | 'luces';

interface InventoryComparison {
  category: string;
  originalComponent: string;
  originalFile: string;
  evolvedComponent: string;
  librarySource: string;
  keyImprovements: string[];
  status: string;
}

const INVENTORY_COMPARISONS: InventoryComparison[] = [
  {
    category: 'shw.n1ReportsAndTemporalAnalytics',
    originalComponent: 'shw.flatChartsOrPlainStatsCards',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'IncidentReportCard (Reaviz AreaChart)',
    librarySource: 'Reaviz',
    keyImprovements: [
      'shw.vectorChartsWithSmoothedInterpolationSmoothAreaInter',
      'shw.automaticTranslucentGradientsCompatibleWithDarkMode',
      'shw.realTimeBreakdownOf3ClinicalVariablesRomArAccuracyAn',
      'shw.responseAndCompensationMetricsWithDirectionalTrendIc'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n2RoutinesAndAssignedTasks',
    originalComponent: 'shw.plainTextListsWithNoTimeBasedProgress',
    originalFile: 'src/pages/ExercisesPage.tsx',
    evolvedComponent: 'shw.assignmentprogresscardAssignmentCards',
    librarySource: 'HeroUI / 21st.dev',
    keyImprovements: [
      'shw.progressBarWithADynamicEmeraldGradientAndPercentageV',
      'shw.overlappingAvatarsOfTheSupervisingPhysiotherapistAnd',
      'shw.countdownTimerForTheNextInPersonOrOnlineMedicalRevie',
      'shw.clinicalPhaseBadgeAndContextualQuickOptionsMenu'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n3SystemAlertsAndNotifications',
    originalComponent: 'shw.homemadeBannersOrPlainAlertText',
    originalFile: 'src/components/ui/InsightBanner.tsx',
    evolvedComponent: 'HeroUI Alert (Alert, Indicator, Content, Title)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.semanticStatesWithAccessibleContrastDefaultAccentSuc',
      'shw.framerMotionEntranceMicroAnimationWithASmoothCloseBu',
      'shw.contextualizedWarningSuccessOrSupabaseConnectionIcon',
      'shw.glassBoxDesignWithRefinedBordersThatDontOverwhelmThe'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n4CriticalConfirmationDialogs',
    originalComponent: 'shw.nativeWindowConfirmPopUps',
    originalFile: 'src/pages/Tokens.tsx / PatientsPage.tsx',
    evolvedComponent: 'HeroUI AlertDialog (Backdrop, Container, Dialog)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.darkLiquidGlassBackdropBackdropBlurMdWithoutBreaking',
      'shw.springPhysicsDamping25Stiffness350OnOpenAndClose',
      'shw.shieldWarningIconForIrreversibleDestructiveOperation',
      'shw.buttonsWithSlotCloseForInstantOneTapClose'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n5AvatarsAndUserIdentification',
    originalComponent: 'shw.plainImgElementsWithNoInitialsFallback',
    originalFile: 'src/components/FisioLayout.tsx',
    evolvedComponent: 'HeroUI Avatar (Avatar, Avatar.Image, Avatar.Fallback)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.automaticInitialsFallbackIfTheImageFailsOrIsSlowToLo',
      'shw.glowingPerimeterRingInMedicalTealRingTeal50020',
      'shw.scalableAcross4StandardSizesSmMdLgXl',
      'shw.safeErrorHandlingWithReferrerpolicyNoReferrer'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n6MultimediaPanelsAndAnnouncements',
    originalComponent: 'shw.flatContentCardsWithNoMultimediaSupport',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'HeroUI PromoCard (Cards with Images)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.responsiveHorizontalLayoutColumnOnMobileRowOnDesktop',
      'shw.imageContainerWithSmoothZoomEffectOnHoverAndASparkle',
      'shw.quickCloseButtonAndCtaButtonToExplorePlatformUpdates',
      'shw.backgroundWithABlurredAmbientRadialGlow'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n7PreferencesAndMultipleCheckboxes',
    originalComponent: 'shw.htmlCheckboxInputsWithNoDarkModeStyles',
    originalFile: 'src/pages/SettingsPage.tsx',
    evolvedComponent: 'HeroUI Checkbox (Surface, CheckboxGroup, Indicator)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.paddedSurfaceWithVisualFeedbackOnSelection',
      'shw.animatedCheckboxWithHighContrastCheckMarkAndTealBord',
      'shw.titlesAndExplanatoryClinicalDescriptionsForEachNotif',
      'shw.fullKeyboardNavigationAndMultiSelectSupport'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n8QuickStatusBadges',
    originalComponent: 'shw.manuallyColoredTextBadges',
    originalFile: 'src/components/clinical/PatientCard.tsx',
    evolvedComponent: 'HeroUI Chip (Chip, Chip.Label)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.definedSemanticColorsSuccessWarningDangerPrimaryNeut',
      'shw.animatedActivityDotOrVectorSvgIcons',
      'shw.compactPillStyleDesignWithASubtleMicroBorder',
      'shw.idealForAdherenceAndDiagnosticSeverityTrafficLights'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n9InteractiveModalsParameters',
    originalComponent: 'shw.basicModalsPositionedWithAbsoluteOrFixed',
    originalFile: 'src/components/ui/GlassModal.tsx',
    evolvedComponent: 'HeroUI Modal (Backdrop, Container, Dialog, CloseTrigger)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.backdropWithDeepOpticalBlurSpringPhysicsAndTheEscape',
      'shw.semanticHeadersWithActionIconAndAutomaticCloseTrigge',
      'shw.integrationWithSlotCloseOnFooterButtonsForABoilerpla',
      'shw.interactiveSliderForBiomechanicalCalibrationAndSensi'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n10ContextualDropdownMenu',
    originalComponent: 'shw.plainTooltipsOrStaticBoxesWithNoDynamicAnchoring',
    originalFile: 'src/components/ui/Tooltip.tsx',
    evolvedComponent: 'HeroUI Popover (Popover, Popover.Content, Popover.Dialog)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.automaticDynamicAnchoringToTheTriggerButtonWithTouch',
      'shw.biomechanicalBreakdownByJointKneeShoulderElbow',
      'shw.visualTrafficLightForOptimalPhysiologicalRangesInRea',
      'shw.smartCloseOnClickOutsideOrEscape'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n11SlidingSidePanel',
    originalComponent: 'shw.forcedFullNavigationToAnotherPageToEdit',
    originalFile: 'src/pages/PatientDetailPage.tsx',
    evolvedComponent: 'HeroUI Drawer (Drawer, Drawer.Dialog, Drawer.Body)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.smoothLateralOpeningFromTheRightWithoutLosingSession',
      'shw.directClinicalAdjustmentOfBiomechanicalToleranceAndT',
      'shw.therapistObservationsAreaAndIntegratedClinicalNotes',
      'shw.tactileSpringPhysicsWithRoundedCornersAtAUnified3xlR'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n12DateRangeSelector',
    originalComponent: 'shw.standardHtmlDateInputsOrPlainCalendars',
    originalFile: 'src/components/ui/SimpleCalendar.tsx',
    evolvedComponent: 'HeroUI DateRangePicker (RangeCalendar, Grid, Popover)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.interactiveTimeRangeSelectionStartAndEndDate',
      'shw.quickClinicalPresetsForTherapists7Days14Days30Days',
      'shw.tealEmeraldGradientHighlightWithRoundedEdgesAtTheEnd',
      'shw.dynamicCalculationOfDaysOfProgressAndScheduledSessio'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n13ScrollOverflowShadows',
    originalComponent: 'shw.standardOverflowYAutoContainersWithNoHiddenContentCu',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'shw.herouiScrollshadowAutomaticGradientShadows',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.detectsOverflowAndAppliesAutomaticTopAndBottomGradie',
      'shw.verticalAndHorizontalSupportWithConfigurableOffset',
      'shw.keepsTheTherapistFromMissingTasksOrExercisesHiddenBy',
      'shw.smoothOpacityTransitionWithNoIntrusiveScrollbars'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n14ProgressiveLoadingPlaceholders',
    originalComponent: 'shw.genericSpinnersOrFlickeringBlankScreens',
    originalFile: 'src/components/ui/Loader.tsx',
    evolvedComponent: 'HeroUI Skeleton (Shimmer, Wave, Pulse)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.shimmerPulseAndWaveEffectsWithFisiomirrorKineticGrad',
      'shw.isloadedSupportWithLayoutDimensionPreservation',
      'shw.textRectAndCircleVariantsAlignedTo2xl3xlRoundedRadii',
      'shw.immediateTactileFeedbackDuringAsynchronousClinicalQu'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n15CanonicalToastNotifications',
    originalComponent: 'shw.blockingAlertsOrStaticHeaderMessages',
    originalFile: 'src/components/ui/GlassToast.tsx',
    evolvedComponent: 'HeroUI / Sonner Toast (toast, toast.success, indicator, action)',
    librarySource: 'HeroUI',
    keyImprovements: [
      'shw.directCallFromAnyFunctionOrCallbackToastMessage',
      'shw.supportForInteractiveActionButtonsDurationsAndCustom',
      'shw.framerMotionSpringPhysicsWithSlidingAndTouchBasedClo',
      'shw.highImpactContrastInDarkModeWithGlowingBordersBySeve'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n16LiveNotificationFeed',
    originalComponent: 'shw.staticListsOfNotificationsOrTextAlerts',
    originalFile: 'src/pages/DashboardFisio.tsx',
    evolvedComponent: 'shw.magicUiAnimatedlistLiveClinicalFeed',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.entranceAnimationWithElasticSpringsSpringPhysicsAndA',
      'shw.smoothScrollingAndProgressiveStackingWithPauseResume',
      'shw.translucentCardsCalibratedWithFisiomirrorTokensAndDa',
      'shw.integrationWithRealMediapipeEventsTokensAndPhysiIaAn'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n17FestiveGoalCelebration',
    originalComponent: 'shw.plainButtonsWithNoVisualFeedbackForAchievementOrProg',
    originalFile: 'src/components/ui/ConfettiButton.tsx',
    evolvedComponent: 'Magic UI / Canvas Confetti (ConfettiSideCannons)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.continuousSimultaneousBurstFromBothScreenEdges60And1',
      'shw.fisiomirrorCorporatePalettePrimaryTealEmeraldKinetic',
      'shw.fluidPhysicsViaRequestanimationframeWithoutOverloadi',
      'shw.idealForMedicalDischargesExceedingJointRangesAndWeek'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n18DynamicTextHighlighter',
    originalComponent: 'shw.staticBgYellow200ClassesOrPlainHtmlUnderlines',
    originalFile: 'src/components/ui/Highlighter.tsx',
    evolvedComponent: 'Magic UI / Rough Notation (Highlighter)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.organicVectorStrokesSimulatingAHandDrawnMarkerWhenEn',
      'shw.sevenVisualModesHighlightUnderlineBoxCircleBracketSt',
      'shw.semanticClinicalVariantsWarningSuccessAccentInfoForD',
      'shw.resizeobserverIntegrationToKeepTheStrokeFaithfulAtAn'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n19InteractiveScrollButton',
    originalComponent: 'shw.traditionalButtonsWithNoDynamicCursorTransitions',
    originalFile: 'src/components/ui/InteractiveHoverButton.tsx',
    evolvedComponent: 'Magic UI (InteractiveHoverButton)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.radialExpansionMicrointeractionWithAnAccentCircleOnH',
      'shw.slidingTextTransitionWithForwardArrowIcon',
      'shw.fullFocusCompatibilityAndKeyboardAccessibility',
      'shw.idealForMainNavigationCtasStartArMirrorSaveRoutine'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n20ProximityKineticTypography',
    originalComponent: 'shw.staticH1H2HeadingsWithNoTypographicInteractivity',
    originalFile: 'src/components/ui/KineticText.tsx',
    evolvedComponent: 'Magic UI (KineticText)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.letterByLetterFontWeightMorphingFrom300To900BasedOnC',
      'shw.dynamicPaddingAndWebkitStrokesOnNeighboringCascadeHa',
      'shw.polymorphicSupportH1H2H3PSpanAndScreenReaderAccessib',
      'shw.bringsAnAvantGardeTechnologicalFeelToWelcomeHeaders'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n21AtmosphericLightRays',
    originalComponent: 'shw.flatBackgroundsOrLifelessStaticGradients',
    originalFile: 'src/components/ui/LightRays.tsx',
    evolvedComponent: 'Magic UI (LightRays)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.swayingLightBeamsWithAngularSwingAndProgressiveFadin',
      'shw.topAmbientRadialLightsCombinedWithColorMixSrgb',
      'shw.controlOfBlurCycleSpeedBeamCountAndLength',
      'shw.createsAPremiumClinicalAtmosphereOnLoginAndMirrorMod'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n22SpringBasedNumberCounter',
    originalComponent: 'shw.staticNumbersThatJumpAbruptlyWithNoInterpolation',
    originalFile: 'src/components/ui/NumberTicker.tsx',
    evolvedComponent: 'Magic UI (NumberTicker)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.springPhysicsDampingStiffnessForSmoothNumericTransit',
      'shw.supportForStartvaluePrefixesSuffixesDecimalsAndCount',
      'shw.automaticActivationWhenEnteringTheViewportWithUseinv',
      'shw.idealForRomAnglesJointsAdherenceAndActivePatients'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n23IlluminatedMagiccard',
    originalComponent: 'shw.cardsWithFlatBordersAndNoCursorResponse',
    originalFile: 'src/components/ui/MagicCard.tsx',
    evolvedComponent: 'Magic UI (MagicCard)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.dualModeDynamicRadialGradientGlowOrDiffusedLuminousO',
      'shw.smoothCursorTrackingPhysicsViaUsespringWithNoAbruptJ',
      'shw.integrationWithDarkLightModeAndPerimeterGradientBord',
      'shw.elevatesTheVisualHierarchyOfQuickActionsAndClinicalS'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n24PixelatedImageWithGradualReveal',
    originalComponent: 'shw.staticImagesWithAbruptLoadingAndNoVisualFeedback',
    originalFile: 'src/components/ui/PixelImage.tsx',
    evolvedComponent: 'Magic UI (PixelImage)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.imageDivisionIntoAPolygonalClipPathGrid6x48x88x3Etc',
      'shw.randomStaggeredAppearanceOfEachFragmentWithSmoothTra',
      'shw.optionalTransitionFromGrayscaleToVibrantColor',
      'shw.idealForPatientAvatarsTherapistsOrRehabilitationMode'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n25DynamicPulsingButton',
    originalComponent: 'shw.flatButtonsWithNoVisualHierarchyOnDenseScreens',
    originalFile: 'src/components/ui/Button.tsx',
    evolvedComponent: 'Magic UI (PulsatingButton)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.concentricPulseWavesOrInfiniteExpandingRippleEffect',
      'shw.adaptiveBackgroundColorCalculationViaReactiveMutatio',
      'shw.immediatelyDrawsAttentionToThePrimaryActionStartArCa',
      'shw.touchDesignCalibratedWithFisiomirrorTokensAndAccessi'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n26ScrollProgressBar',
    originalComponent: 'shw.standardBrowserBarsOrNoIndicatorAtAll',
    originalFile: 'src/components/ui/ScrollProgress.tsx',
    evolvedComponent: 'Magic UI / Motion (ScrollProgress)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.continuousScrollyprogressTrackingViaGpuAccelerationW',
      'shw.fisiomirrorCanonicalGradientTeal600ToCyanAndKineticL',
      'shw.supportForGloballyFixedTopPositionOrAnchoredToAConta',
      'shw.idealForClinicalGuidesExerciseProtocolsAndLongRecord'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n27ButtonWithSlidingShine',
    originalComponent: 'shw.solidDarkButtonsWithNoPremiumDynamism',
    originalFile: 'src/components/ui/ShimmerButton.tsx',
    evolvedComponent: 'Magic UI (ShimmerButton)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.continuousRotatingConicalShineEffectWithConicGradien',
      'shw.depthWithBeveledInnerShadowsAndGpuAcceleration',
      'shw.idealForHighPriorityActionsGenerateAiReportsAndExpor',
      'shw.fullyResponsiveAndStyledWithTheFisiomirrorMedicalIde'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n28AnimatedGlowingBorder',
    originalComponent: 'shw.flatStaticBordersWithNoDynamicHighlight',
    originalFile: 'src/components/ui/ShineBorder.tsx',
    evolvedComponent: 'Magic UI (ShineBorder)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.animatedRadialGradientThatContinuouslyTravelsTheCont',
      'shw.dualCssMaskContentBoxVsBorderBoxWithNativeXorExclusi',
      'shw.supportForMultipleColorsInArrayTealCyanKineticLime',
      'shw.accentuatesLoginCardsAiReportsAndCriticalBiomechanic'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n29TextWithMagicSparkles',
    originalComponent: 'shw.staticHeadingsWithNoFestiveOrGamifiedElements',
    originalFile: 'src/components/ui/SparklesText.tsx',
    evolvedComponent: 'Magic UI (SparklesText)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.vectorSparklesAndStarsThatSpawnRotateAndScaleRandoml',
      'shw.colorsAdaptedToTheMedicalPaletteTeal0d9488AndKinetic',
      'shw.dynamicLifecycleOptimizedWithANonBlockingTimer',
      'shw.positiveReinforcementForAchievementCelebrationsStrea'
    ],
    status: 'shw.activeInGallery'
  },
  {
    category: 'shw.n30SegmentedAnimatedText',
    originalComponent: 'shw.textThatAppearsAbruptlyWithNoTypographicTransition',
    originalFile: 'src/components/ui/TextAnimate.tsx',
    evolvedComponent: 'Magic UI (TextAnimate)',
    librarySource: 'Magic UI',
    keyImprovements: [
      'shw.segmentationByWordCharacterLineOrFullTextWithStagger',
      'shw.n10CinematicVariantsBlurinBlurinupSlideupScaleupFadei',
      'shw.strictAccessibilitySupportWithSrOnlyHiddenTextAndAri',
      'shw.perfectForWelcomeGreetingsDiagnosticHeadingsAndAiMes'
    ],
    status: 'shw.activeInGallery'
  }
];

const buildSampleRoutineCards = (t: (key: string) => string): RoutineCardData[] => [
  {
    id: 1,
    date: t('shw.prescribedOctober08'),
    title: t('shw.lumbarRoutineActiveMobility'),
    description: t('shw.n3DailyExercisesFocusedOnCoreStabilizationAndLumbosac'),
    progressValue: '75%',
    countdownText: t('shw.reviewIn2Days'),
    badge: t('shw.phase2'),
    imgSrc1: '/physi.png',
    imgAlt1: t('shw.physioDrRamos'),
    imgSrc2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    imgAlt2: t('shw.patientCarlos'),
  },
  {
    id: 2,
    date: t('shw.prescribedOctober06'),
    title: t('shw.rotatorCuffRehabilitation'),
    description: t('shw.externalRotationWithElasticBandAndRealTimeAngularBio'),
    progressValue: '40%',
    countdownText: t('shw.nextSessionToday'),
    badge: t('shw.phase1'),
    imgSrc1: '/physi.png',
    imgAlt1: t('shw.physioDrRamos'),
  },
  {
    id: 3,
    date: t('shw.prescribedOctober01'),
    title: t('shw.quadricepsKneeStrengthening'),
    description: t('shw.assistedSquatAt90WithWebcamBasedDynamicValgusDetecti'),
    progressValue: '90%',
    countdownText: t('shw.upcomingDischargeIn4Days'),
    badge: t('shw.upcomingDischarge'),
    imgSrc1: '/physi.png',
    imgAlt1: t('shw.physioDrRamos'),
    imgSrc2: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    imgAlt2: t('shw.patientLucia'),
  },
];

export function UIShowcasePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sampleRoutineCards = useMemo(() => buildSampleRoutineCards(t), [t]);
  const [activeTab, setActiveTab] = useState<FilterTab>('todos');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSize, setDialogSize] = useState<'sm' | 'md' | 'lg' | 'full'>('md');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Button state
  const [buttonLoading, setButtonLoading] = useState(false);

  // Input states
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [inputGlass, setInputGlass] = useState(true);

  // OTP state
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpCompletedCode, setOtpCompletedCode] = useState<string | null>(null);

  // Clinical Slider state
  const [clinicalRom, setClinicalRom] = useState(115);
  const [tickerTrigger, setTickerTrigger] = useState(1);

  // Estados interactivos para los 7 Nuevos Componentes
  const [highlighterAction, setHighlighterAction] = useState<AnnotationAction>('highlight');
  const [highlighterKey, setHighlighterKey] = useState(0);
  const [magicCardMode, setMagicCardMode] = useState<'gradient' | 'orb'>('gradient');
  const [pixelGridKey, setPixelGridKey] = useState<'6x4' | '8x8' | '8x3'>('6x4');
  const [pixelReplayKey, setPixelReplayKey] = useState(0);
  const [tickerRomValue, setTickerRomValue] = useState(132);
  const [kineticInputText, setKineticInputText] = useState('FisioMirror');

  // Estados interactivos para la nueva suite de 6 componentes
  const [pulsatingVariant, setPulsatingVariant] = useState<'pulse' | 'ripple'>('pulse');
  const [pulsatingColor, setPulsatingColor] = useState<string>('rgba(13, 148, 136, 0.6)');
  const [textAnimateType, setTextAnimateType] = useState<AnimationType>('word');
  const [textAnimateVariant, setTextAnimateVariant] = useState<AnimationVariant>('blurInUp');
  const [textAnimateKey, setTextAnimateKey] = useState(0);
  const [sparklesWord, setSparklesWord] = useState(t('shw.rehabilitationComplete'));

  // Estados interactivos para la Suite Estelar Biomecánica & Gamificación (8 Componentes)
  const [gaugeAngle, setGaugeAngle] = useState(128);
  const [gaugeTarget, setGaugeTarget] = useState(135);
  const [gaugeJoint, setGaugeJoint] = useState('shw.rightKnee');
  const [dockSelectedJoint, setDockSelectedJoint] = useState('Rodilla');
  const [springReps, setSpringReps] = useState(12);
  const [energyLevel, setEnergyLevel] = useState(78);
  const [fatigueLevel, setFatigueLevel] = useState(3.2);
  const [alertSeverity, setAlertSeverity] = useState<'mild' | 'moderate' | 'high'>('moderate');

  // Estado para la Macro Suite de 50 Componentes
  const [megaSuiteCategory, setMegaSuiteCategory] = useState<'all' | 'actividad' | 'realtime' | 'flotantes' | 'gamificacion' | 'navegacion'>('all');

  // Estado para Armonización Pastel Clínica
  const [activePastelDemo, setActivePastelDemo] = useState<'sky' | 'mint' | 'lavender' | 'gradient'>('mint');
  const [pastelFinish, setPastelFinish] = useState<'glass' | 'solid'>('glass');

  // Estado para PWA Móvil & Físicas de Resorte
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetSnap, setBottomSheetSnap] = useState<BottomSheetSnapPoint>('medium');
  const [bottomSheetVariant, setBottomSheetVariant] = useState<'default' | 'pastel-mint' | 'pastel-sky' | 'pastel-lavender'>('pastel-mint');
  const [compactJoint, setCompactJoint] = useState('rodilla');
  const [compactRom, setCompactRom] = useState(125);
  const [compactTolerance, setCompactTolerance] = useState<'strict' | 'standard' | 'relaxed'>('standard');

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'todos', label: t('shw.allComponents'), icon: <Layers className="w-4 h-4" /> },
    { id: 'megasuite', label: t('shw.macroSuite50'), icon: <Sparkles className="w-4 h-4 text-cyan-400" />, count: 50 },
    { id: 'mobile', label: t('shw.pwaMobileMotion'), icon: <Smartphone className="w-4 h-4 text-emerald-400" />, count: 6 },
    { id: 'armonizacion', label: t('shw.pastelHarmonization'), icon: <Sparkles className="w-4 h-4 text-sky-400" />, count: 12 },
    { id: 'estelar', label: t('shw.starSuite'), icon: <Activity className="w-4 h-4 text-emerald-400" />, count: 8 },
    { id: 'solicitados', label: t('shw.previousSuite'), icon: <Sparkles className="w-4 h-4" />, count: 30 },
    { id: 'comparativa', label: t('shw.inventoryMapping'), icon: <Search className="w-4 h-4" />, count: INVENTORY_COMPARISONS.length },
    { id: 'botones', label: t('shw.evolvedButtons'), icon: <Zap className="w-4 h-4" /> },
    { id: 'tarjetas', label: t('shw.cardsBento'), icon: <MousePointer className="w-4 h-4" /> },
    { id: 'modales', label: t('shw.glassModals'), icon: <Eye className="w-4 h-4" /> },
    { id: 'entradas', label: t('shw.inputsOtp'), icon: <Smartphone className="w-4 h-4" /> },
    { id: 'clinicos', label: t('shw.clinicalControls'), icon: <Sliders className="w-4 h-4" /> },
    { id: 'luces', label: t('shw.typographyLights'), icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#090d12] text-on-surface p-4 sm:p-6 lg:p-10 transition-colors">
      {/* 26. Barra de Progreso de Desplazamiento Global */}
      <ScrollProgress />

      <div className="fm-page max-w-6xl">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BackButton onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>{t('shw.back')}</span>
            </BackButton>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                  FisioMirror UI Lab
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20">
                  {t('shw.cliMcpEcosystemActive')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Reaviz · HeroUI · Magic UI · Aceternity
                </span>
              </div>
              <h1 className="fm-title mt-1 flex items-center gap-2">
                {t('shw.evolvedComponentsGallery')}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                {t('shw.inventorySectionDescription')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip content={t('shw.goToThePhysiotherapistDashboard')} side="bottom">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard-fisio')}>
                {t('shw.clinicalDashboard')}
              </Button>
            </Tooltip>
            <Tooltip content={t('shw.goToThePatientLinkingScreen')} side="bottom">
              <Button variant="glow" glowEffect size="sm" onClick={() => navigate('/registro-paciente')} icon={<Zap className="w-3.5 h-3.5" />}>
                {t('shw.tokenRegistration')}
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* System KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs">
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">{t('shw.componentsUsed')}</span>
            <div className="text-xl sm:text-2xl font-black text-on-surface tabular-nums flex items-baseline gap-1">
              <span>72</span>
              <span className="text-2xs font-medium text-on-surface-variant">{t('shw.inFisiomirror')}</span>
            </div>
          </div>
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">{t('shw.newlyRequested')}</span>
            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 tabular-nums flex items-baseline gap-1">
              <span>12</span>
              <span className="text-2xs font-medium text-teal-500/80">{t('shw.fullyIntegrated')}</span>
            </div>
          </div>
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">{t('shw.vectorCharts')}</span>
            <div className="text-xl sm:text-2xl font-black text-lime-600 dark:text-lime-400 tabular-nums flex items-baseline gap-1">
              <span>Reaviz</span>
              <span className="text-2xs font-medium text-on-surface-variant">{t('shw.smoothAreas')}</span>
            </div>
          </div>
          <div>
            <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">{t('shw.microInteraction')}</span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums flex items-baseline gap-1">
              <span>&lt; 300ms</span>
              <span className="text-2xs font-medium text-on-surface-variant">{t('shw.goldenRule')}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 dark:border-slate-800/80 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-sm shadow-teal-600/30'
                  : 'bg-white/60 dark:bg-slate-800/60 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-slate-100 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-2xs bg-white/20 text-white font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MACRO SUITE: 50 NUEVOS COMPONENTES EN 5 CATEGORÍAS MODULARES
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'megasuite') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-cyan-500/10 via-surface/70 to-surface border border-cyan-500/30 shadow-elevated">
            {/* Header de la Macro Suite */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cyan-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    {t('shw.macroSuiteFisioMirror50')}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  {t('shw.massiveCatalogDescription')}
                </p>
              </div>

              {/* Sub-selector de las 5 Macro Categorías */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: t('shw.all50') },
                  { id: 'actividad', label: t('shw.n1Diagnostics10') },
                  { id: 'realtime', label: t('shw.n2RealTime10') },
                  { id: 'flotantes', label: t('shw.floatingPopovers10') },
                  { id: 'gamificacion', label: t('shw.n4Gamification10') },
                  { id: 'navegacion', label: t('shw.n5DocksMenus10') },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMegaSuiteCategory(cat.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                      megaSuiteCategory === cat.id
                        ? "bg-cyan-600 text-white shadow-sm"
                        : "bg-surface-container-low text-on-surface-variant hover:text-on-surface dark:hover:text-white"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CATEGORÍA 1: TARJETAS DE ACTIVIDAD Y DIAGNÓSTICO (1 - 10) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'actividad') && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-cyan-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.category1ActivityCards')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MegaSuite.MuscleTargetRadarCard />
                  <MegaSuite.PainScaleInteractiveCard />
                  <MegaSuite.GaitSymmetryCard />
                  <MegaSuite.TremorFrequencyCard />
                  <MegaSuite.PostureStabilityCard />
                  <MegaSuite.CardioEffortPillCard />
                  <MegaSuite.RehabPhaseStepCard />
                  <MegaSuite.EdemaAssessmentCard />
                  <MegaSuite.StrengthProgressionCard />
                  <MegaSuite.PatientAdherenceHeatmapCard />
                </div>
              </div>
            )}

            {/* CATEGORÍA 2: PANELES Y MÉTRICAS EN TIEMPO REAL (11 - 20) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'realtime') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-teal-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.category2RealTimePanels')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MegaSuite.PoseConfidenceLiveIndicator />
                  <MegaSuite.AngularVelocityStreamGauge />
                  <MegaSuite.ROMDeviationLiveChart />
                  <MegaSuite.VoiceFeedbackWaveHUD />
                  <MegaSuite.CameraFramingGuideHUD />
                  <MegaSuite.RepCadenceMetronome />
                  <MegaSuite.AIBiomechanicalSummaryBadge />
                  <MegaSuite.SkeletonJointSelectorHUD />
                  <MegaSuite.HoldDurationTimerRing />
                  <MegaSuite.SessionQualityScoreTile />
                </div>
              </div>
            )}

            {/* CATEGORÍA 3: MICROINTERACCIONES Y CONTROLES FLOTANTES (21 - 30) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'flotantes') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-indigo-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.category3Microinteractions')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-container-low/40">
                  <MegaSuite.JointAnatomyTooltip />
                  <MegaSuite.ARCameraFilterDropdown />
                  <MegaSuite.RapidToleranceAdjuster />
                  <MegaSuite.AudioMuteFloatingPill />
                  <MegaSuite.ExerciseSwitchFloatingMenu />
                  <MegaSuite.PhysioNoteAnnotationBubble />
                  <MegaSuite.QuickPrescriptionModalButton />
                  <MegaSuite.BiomechanicalTagSelector />
                  <MegaSuite.CalibrationCompass />
                  <MegaSuite.FloatingMiniStopwatch />
                </div>
              </div>
            )}

            {/* CATEGORÍA 4: GAMIFICACIÓN Y MOTIVACIÓN (31 - 40) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'gamificacion') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.category4Gamification')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MegaSuite.StreakFlameCounter />
                  <MegaSuite.LevelProgressRibbon />
                  <MegaSuite.MilestoneCelebrationModal />
                  <MegaSuite.MobilityQuestCard />
                  <MegaSuite.VirtualTrophyCabinet />
                  <MegaSuite.DailyHealthPointsWidget />
                  <MegaSuite.RehabHeroAvatarCard />
                  <div className="flex items-center justify-center p-4 rounded-3xl bg-surface-container-low">
                    <MegaSuite.CheerReactionButton />
                  </div>
                  <div className="flex items-center justify-center p-4 rounded-3xl bg-surface-container-low">
                    <MegaSuite.RecoveryRankBadge />
                  </div>
                  <MegaSuite.UnlockableExerciseLocker />
                </div>
              </div>
            )}

            {/* CATEGORÍA 5: DOCKS Y NAVEGACIÓN ERGONÓMICA (41 - 50) */}
            {(megaSuiteCategory === 'all' || megaSuiteCategory === 'navegacion') && (
              <div className="space-y-4 pt-4 border-t border-cyan-500/15">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.category5DocksNavigation')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-container-low/40">
                  <MegaSuite.CurvedMobileDock />
                  <div className="flex items-center justify-center">
                    <MegaSuite.TherapistSidebarMini />
                  </div>
                  <MegaSuite.QuickPatientSwitcherBar />
                  <div className="flex items-center justify-center">
                    <MegaSuite.SessionStateBreadcrumb />
                  </div>
                  <div className="flex items-center justify-center">
                    <MegaSuite.SplitViewPerspectiveToggle />
                  </div>
                  <div className="flex items-center justify-center">
                    <MegaSuite.FloatingHelpBeacon />
                  </div>
                  <div className="flex items-center justify-center">
                    <MegaSuite.ErgonomicHandModeSwitcher />
                  </div>
                  <MegaSuite.CompactTelehealthBar />
                  <MegaSuite.ExerciseTimelineScrubber />
                  <div className="flex items-center justify-center">
                    <MegaSuite.ContextualActionIsland />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            NUEVA SECCIÓN ESTELAR: 8 COMPONENTES BIOMECÁNICOS, AR & GAMIFICACIÓN
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'estelar') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-teal-500/10 via-surface/60 to-surface border border-teal-500/30 shadow-card">
            {/* Header de la Suite Estelar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-teal-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
                    <Activity className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    {t('shw.fisiomirrorStellarInnovationSuite')}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  {t('shw.starSectionDescription')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                  {t('shw.n8Of8NewOperational')}
                </span>
              </div>
            </div>

            {/* Fila 1: BiomechanicalAngleGauge & RepetitionCounterSpring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. BiomechanicalAngleGauge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-500" />
                    {t('shw.m1BiomechanicalGauge')}
                  </h3>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {t('shw.m1BiomechanicalGaugeDescription')}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                    <BiomechanicalAngleGauge
                      currentAngle={gaugeAngle}
                      targetAngle={gaugeTarget}
                      minAngle={0}
                      maxAngle={180}
                      safeTolerance={8}
                      jointName={t(gaugeJoint)}
                    />

                    {/* Interactive Simulator Controls */}
                    <div className="flex-1 w-full space-y-3 p-4 rounded-2xl bg-surface-container-low/60 dark:bg-slate-900/60 border border-outline-variant/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block">
                        {t('shw.liveAngleSimulator')}
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-on-surface-variant">{t('shw.currentAngle')}</span>
                          <span className="font-bold text-teal-600 dark:text-teal-400">{gaugeAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={170}
                          value={gaugeAngle}
                          onChange={(e) => setGaugeAngle(Number(e.target.value))}
                          className="w-full accent-teal-600 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-on-surface-variant">{t('shw.prescribedTarget')}</span>
                          <span className="font-bold text-primary">{gaugeTarget}°</span>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={160}
                          value={gaugeTarget}
                          onChange={(e) => setGaugeTarget(Number(e.target.value))}
                          className="w-full accent-primary cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 flex gap-1.5">
                        {['shw.rightKnee', 'shw.leftElbow', 'shw.shoulder'].map((j) => (
                          <button
                            key={j}
                            type="button"
                            onClick={() => setGaugeJoint(j)}
                            className={cn(
                              "px-2 py-1 rounded-lg text-2xs font-semibold border transition-all",
                              gaugeJoint === j
                                ? "bg-primary text-on-primary border-primary"
                                : "bg-white/60 dark:bg-slate-800 text-on-surface-variant border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {t(j)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. RepetitionCounterSpring */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-500" />
                    {t('shw.m2RepetitionCounterSpring')}
                  </h3>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {t('shw.highVisibilityKineticCounterForArMirrorModeWithElast')}
                  </p>

                  <RepetitionCounterSpring
                    currentReps={springReps}
                    targetReps={15}
                    cadenceSeconds={3.0}
                    onIncrement={() => setSpringReps((r) => r + 1)}
                    onReset={() => setSpringReps(0)}
                  />
                </div>
              </div>
            </div>

            {/* Fila 2: ARFloatingDock & TherapistQuickToolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-teal-500/20">
              {/* 3. ARFloatingDock */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  {t('shw.m3ArFloatingDock')}
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[190px]">
                  <p className="text-xs text-on-surface-variant text-center max-w-md">
                    {t('shw.designedForTheLowerPartOfArMirrorModeMagnifiesIconsO')}
                  </p>
                  
                  <ARFloatingDock
                    currentJoint={dockSelectedJoint}
                    onSelectJoint={(j) => setDockSelectedJoint(j)}
                  />
                </div>
              </div>

              {/* 4. TherapistQuickToolbar */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  {t('shw.m4TherapistQuickToolbar')}
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[190px]">
                  <p className="text-xs text-on-surface-variant text-center max-w-md">
                    {t('shw.m4TherapistToolbarDescription')}
                  </p>

                  <TherapistQuickToolbar />
                </div>
              </div>
            </div>

            {/* Fila 3: RehabEnergyBar & CompensationAlertBanner */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-teal-500/20">
              {/* 5. RehabEnergyBar */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  {t('shw.m5RehabEnergyBar')}
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <RehabEnergyBar
                    currentEnergy={energyLevel}
                    fatigueScore={fatigueLevel}
                    repsCompleted={springReps}
                    totalTargetReps={20}
                  />

                  {/* Energy simulator sliders */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-2xs uppercase font-bold text-on-surface-variant block mb-1">
                        {t('shw.energyLabel')} {energyLevel}%
                      </span>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={energyLevel}
                        onChange={(e) => setEnergyLevel(Number(e.target.value))}
                        className="w-full accent-teal-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-2xs uppercase font-bold text-on-surface-variant block mb-1">
                        {t('shw.fatigueLabel')} {fatigueLevel.toFixed(1)}/10
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={fatigueLevel}
                        onChange={(e) => setFatigueLevel(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. CompensationAlertBanner */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-teal-500" />
                    {t('shw.m6CompensationAlertBanner')}
                  </h3>
                  <div className="flex gap-1">
                    {(['mild', 'moderate', 'high'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAlertSeverity(s)}
                        className={cn(
                          "px-2 py-0.5 rounded text-2xs font-bold capitalize transition-all",
                          alertSeverity === s ? "bg-primary text-on-primary" : "bg-slate-200 dark:bg-slate-800 text-on-surface-variant"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant">
                    {t('shw.realTimeSemanticBiofeedbackAlertWhenMediapipeDetects')}
                  </p>

                  <CompensationAlertBanner
                    deviationJoint={t('shw.scapulaLeftShoulder')}
                    detectedIssue={t('shw.excessiveTrapeziusElevationDuringExternalRotation')}
                    recommendedCorrection={t('shw.lowerTheShoulderEngageTheLatsAndKeepTheElbowTuckedAg')}
                    severity={alertSeverity}
                  />
                </div>
              </div>
            </div>

            {/* Fila 4: GamifiedBadgeCard & JointDetailPopover */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-teal-500/20">
              {/* 7. GamifiedBadgeCard */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  {t('shw.m7GamifiedBadgeCard')}
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant">
                    {t('shw.m7HolographicCardDescription')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GamifiedBadgeCard
                      title={t('shw.mobilityMaster')}
                      category={t('shw.categoryRom')}
                      description={t('shw.youCompleted5ConsecutiveSessionsExceeding120OfSafeFl')}
                      level={4}
                      xpPoints={300}
                      unlocked={true}
                      iconName="trophy"
                    />

                    <GamifiedBadgeCard
                      title={t('shw.flawlessPosture')}
                      category={t('shw.categoryBiomechanics')}
                      description={t('shw.n0CompensationsDetectedByMediapipeAcrossAFullSetOf15R')}
                      level={2}
                      xpPoints={150}
                      unlocked={true}
                      iconName="sparkles"
                    />
                  </div>
                </div>
              </div>

              {/* 8. JointDetailPopover */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                  <span className="size-2 rounded-full bg-teal-500" />
                  {t('shw.m8JointDetailPopover')}
                </h3>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[260px]">
                  <p className="text-xs text-on-surface-variant text-center max-w-sm mb-2">
                    {t('shw.m8JointPopoverDescription')}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <JointDetailPopover
                      triggerLabel={t('shw.inspectRightKnee')}
                      metrics={{
                        jointName: t('shw.rightKneeFlexion'),
                        currentRom: gaugeAngle,
                        maxHistoricalRom: 135,
                        angularVelocity: 48,
                        asymmetryPercentage: 6,
                        status: 'normal',
                      }}
                    />

                    <JointDetailPopover
                      triggerLabel={t('shw.inspectLeftShoulder')}
                      metrics={{
                        jointName: t('shw.leftShoulderAbduction'),
                        currentRom: 112,
                        maxHistoricalRom: 120,
                        angularVelocity: 36,
                        asymmetryPercentage: 14,
                        status: 'warning',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            PWA MÓVIL DE ALTA DENSIDAD & MOTOR DE MOTION PRÉMIUM
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'mobile') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-surface border border-emerald-500/25 shadow-elevated">
            {/* Header de la Suite Móvil */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Smartphone className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    {t('shw.pwaMobileHighDensity')}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  {t('shw.eradicatingInfiniteScroll')}
                </p>
              </div>

              {/* Botón de Activación del Bottom Sheet en Vivo */}
              <div className="flex items-center gap-2 flex-wrap">
                <TactileFeedback>
                  <button
                    type="button"
                    onClick={() => setIsBottomSheetOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-card shadow-teal-600/25 border border-teal-400/40"
                  >
                    <Sliders className="size-4" />
                    <span>{t('shw.openMobileBottomSheet')}</span>
                  </button>
                </TactileFeedback>
              </div>
            </div>

            {/* Demostración 1: Selectores Compactos de Alta Densidad */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    {t('shw.n1CompactOneTapSelectors')}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {t('shw.designedToReplaceSmallInputsAndClumsyDropdownsOnSmar')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Selector Segmentado de Articulación */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <CompactJointSelector
                    selectedJoint={compactJoint}
                    onSelectJoint={(j) => setCompactJoint(j)}
                  />
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">{t('shw.selected')}</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 uppercase">{compactJoint}</span>
                  </div>
                </div>

                {/* Stepper Táctil de ROM con Físicas */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <CompactRomStepper
                    value={compactRom}
                    onChange={(val) => setCompactRom(val)}
                    min={30}
                    max={170}
                    step={5}
                    label={t('shw.jointRomTarget')}
                  />
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">{t('shw.clinicalStatus')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{t('shw.safeRange12')}</span>
                  </div>
                </div>

                {/* Dropdown Popover de Tolerancia IA */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-on-surface-variant block px-1">
                      {t('shw.mediapipeCalibration')}
                    </span>
                    <CompactToleranceDropdown
                      tolerance={compactTolerance}
                      onChange={(t) => setCompactTolerance(t)}
                    />
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">{t('shw.sensitivity')}</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                      {compactTolerance === 'strict' ? t('shw.n3Precise') : compactTolerance === 'standard' ? t('shw.n7Standard') : t('shw.n12Assisted')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demostración 2: Wrappers de Motion & Microinteracciones Táctiles */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                {t('shw.n2MotionWrappers')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Blur-Fade InView Demo */}
                <MotionBlurFade delay={0.1} className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-surface/90 to-sky-50/40 dark:from-teal-950/25 dark:via-surface-container/80 dark:to-slate-900/90 border border-teal-200/50 dark:border-teal-500/25 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                      {t('shw.motionblurfadeWrapper')}
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">ease: [0.16, 1, 0.3, 1]</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">
                    {t('shw.progressiveRevealWithDynamicBlur')}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {t('shw.medicalStatsAppear')}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-teal-500 to-sky-400 rounded-full" />
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">80%</span>
                  </div>
                </MotionBlurFade>

                {/* TactileFeedback Interactive Demo */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {t('shw.tactilefeedbackWrapper')}
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">stiffness: 420 · damping: 18</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">
                    {t('shw.immediateVisualTactileFeedback')}
                  </h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {t('shw.tapOrClickTheTestButtonsToFeelTheOptimizedSpringPhys')}
                  </p>
                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <TactileFeedback>
                      <button
                        type="button"
                        onClick={() => {
                          setCompactRom((r) => Math.min(180, r + 5));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-xs"
                      >
                        {t('shw.n5QuickRom')}
                      </button>
                    </TactileFeedback>

                    <TactileFeedback>
                      <button
                        type="button"
                        onClick={() => {
                          setCompactRom((r) => Math.max(30, r - 5));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-on-surface font-bold text-xs border border-slate-200 dark:border-slate-700"
                      >
                        {t('shw.n5QuickRom2')}
                      </button>
                    </TactileFeedback>

                    <TactileFeedback>
                      <button
                        type="button"
                        onClick={() => setIsBottomSheetOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-200 dark:border-sky-500/30"
                      >
                        {t('shw.tryBottomSheet')}
                      </button>
                    </TactileFeedback>
                  </div>
                </div>
              </div>
            </div>

            {/* Demostración 3: Previsualización de la Barra Fija Inferior (MobileFixedDock) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />
                {t('shw.n3MobileFixedDock')}
              </h3>
              <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                <p className="text-xs text-on-surface-variant">
                  {t('shw.mobileFixedDockDescription')}
                </p>
                <div className="max-w-md mx-auto p-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-around text-center text-2xs font-bold text-on-surface-variant">
                  <div className="py-1 px-3 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300">
                    <Home className="size-4 mx-auto mb-0.5" />
                    <span>{t('shw.home')}</span>
                  </div>
                  <div className="py-1 px-3">
                    <Users className="size-4 mx-auto mb-0.5" />
                    <span>{t('shw.patients')}</span>
                  </div>
                  <div className="size-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-400 text-white flex flex-col items-center justify-center -mt-3 shadow-sm">
                    <Camera className="size-4" />
                    <span className="text-2xs">AR</span>
                  </div>
                  <div className="py-1 px-3">
                    <Dumbbell className="size-4 mx-auto mb-0.5" />
                    <span>{t('shw.exercises')}</span>
                  </div>
                  <div className="py-1 px-3">
                    <Sparkles className="size-4 mx-auto mb-0.5" />
                    <span>Physi IA</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Componente Modal Bottom Sheet Renderizado en Vivo para la Demostración */}
        <MobileBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          title={t('shw.quickCardMobileCalibration')}
          subtitle={t('shw.ergonomicAdjustmentWithoutInfiniteScroll')}
          icon={<Sliders className="size-5" />}
          snapPoint={bottomSheetSnap}
          onSnapPointChange={(snap) => setBottomSheetSnap(snap)}
          variant={bottomSheetVariant}
          footerActions={
            <>
              <button
                type="button"
                onClick={() => setIsBottomSheetOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('shw.close')}
              </button>
              <TactileFeedback>
                <button
                  type="button"
                  onClick={() => {
                    setIsBottomSheetOpen(false);
                    navigate('/ar-mirror');
                  }}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm shadow-teal-600/30"
                >
                  {t('shw.startArMirror')}
                </button>
              </TactileFeedback>
            </>
          }
        >
          <div className="space-y-4">
            {/* Controles de snap point dentro del sheet */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-on-surface">
                {t('shw.heightLevelSnapPoint')}
              </span>
              <div className="flex items-center gap-1">
                {(['peek', 'medium', 'full'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBottomSheetSnap(s)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all',
                      bottomSheetSnap === s
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:bg-slate-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {s === 'peek' ? t('shw.compact35') : s === 'medium' ? t('shw.medium65') : t('shw.full92')}
                  </button>
                ))}
              </div>
            </div>

            {/* Selectores Compactos embebidos */}
            <CompactJointSelector
              selectedJoint={compactJoint}
              onSelectJoint={(j) => setCompactJoint(j)}
            />

            <CompactRomStepper
              value={compactRom}
              onChange={(val) => setCompactRom(val)}
              label={t('shw.romTargetInMobileSession')}
            />

            <CompactToleranceDropdown
              tolerance={compactTolerance}
              onChange={(t) => setCompactTolerance(t)}
            />

            {/* Resumen clínico en sheet */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-500/25 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  {t('shw.biomechanicalReport')}
                </span>
                <span className="text-2xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  {t('shw.aiActive')}
                </span>
              </div>
              <p className="text-xs text-teal-950 dark:text-teal-100 font-medium">
                {t('shw.readyToStartSession', { joint: compactJoint, rom: compactRom, tol: compactTolerance })}
              </p>
            </div>
          </div>
        </MobileBottomSheet>

        {/* ─────────────────────────────────────────────────────────────
            ARMONIZACIÓN CROMÁTICA PASTEL CLÍNICA: SOFT SKY, MINT & LAVENDER
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'armonizacion') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-sky-500/10 via-teal-500/5 to-surface border border-sky-500/25 shadow-elevated">
            {/* Header de la Armonización */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sky-500/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="fm-title text-on-surface">
                    {t('shw.clinicalPastelHarmony')}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl">
                  {t('shw.clinicalPastelHarmonyDescription')}
                </p>
              </div>

              {/* Selector interactivo de tono y acabado */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40">
                  {(['sky', 'mint', 'lavender', 'gradient'] as const).map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setActivePastelDemo(tone)}
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-lg capitalize transition-all",
                        activePastelDemo === tone
                          ? "bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200"
                      )}
                    >
                      {tone === 'sky' ? t('shw.skyBlue') : tone === 'mint' ? t('shw.mint') : tone === 'lavender' ? t('shw.lavender') : t('shw.gradient')}
                    </button>
                  ))}
                </div>

                <div className="flex items-center p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40">
                  <button
                    type="button"
                    onClick={() => setPastelFinish('glass')}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
                      pastelFinish === 'glass'
                        ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200"
                    )}
                  >
                    {t('shw.translucentGlass')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPastelFinish('solid')}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg transition-all",
                      pastelFinish === 'solid'
                        ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface dark:hover:text-slate-200"
                    )}
                  >
                    {t('shw.solidLayer')}
                  </button>
                </div>
              </div>
            </div>

            {/* Fila 1: Las 3 Familias Cromáticas Pastel en Vivo (HarmonizedSurface) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Celeste Pastel (Soft Sky) */}
              <HarmonizedSurface
                variant={pastelFinish === 'glass' ? 'pastel-sky' : 'card'}
                className={cn(
                  "p-5 rounded-2xl relative overflow-hidden transition-all duration-300",
                  pastelFinish === 'solid' && CLINICAL_PASTELS.sky.solid,
                  activePastelDemo === 'sky' && "ring-2 ring-sky-400/60 shadow-card"
                )}
                interactive
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold ring-2 ring-sky-400/30">
                    <Activity className="size-5" />
                  </div>
                  <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-700 dark:text-sky-300">
                    {t('shw.softSky')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-sky-950 dark:text-sky-100 mb-1">
                  {t('shw.clinicalPastelSkyBlue')}
                </h3>
                <p className="text-xs text-sky-700/80 dark:text-sky-300/80 mb-4 leading-relaxed">
                  {t('shw.idealForTelemetry')}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-sky-200/50 dark:border-sky-500/20 text-xs font-semibold">
                  <span className="text-sky-800 dark:text-sky-200">{t('shw.romAngle')}</span>
                  <span className="font-mono font-black text-sky-600 dark:text-sky-300">128.4° (+4.2%)</span>
                </div>
              </HarmonizedSurface>

              {/* Menta / Turquesa Suave (Mint/Teal) */}
              <HarmonizedSurface
                variant={pastelFinish === 'glass' ? 'pastel-mint' : 'card'}
                className={cn(
                  "p-5 rounded-2xl relative overflow-hidden transition-all duration-300",
                  pastelFinish === 'solid' && CLINICAL_PASTELS.mint.solid,
                  activePastelDemo === 'mint' && "ring-2 ring-teal-400/60 shadow-card"
                )}
                interactive
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold ring-2 ring-teal-400/30">
                    <Heart className="size-5" />
                  </div>
                  <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300">
                    {t('shw.mintTeal')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-teal-950 dark:text-teal-100 mb-1">
                  {t('shw.pastelMintTurquoise')}
                </h3>
                <p className="text-xs text-teal-700/80 dark:text-teal-300/80 mb-4 leading-relaxed">
                  {t('shw.primaryChromaticAxis')}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-teal-200/50 dark:border-teal-500/20 text-xs font-semibold">
                  <span className="text-teal-800 dark:text-teal-200">{t('shw.weeklyAdherence')}</span>
                  <span className="font-mono font-black text-teal-600 dark:text-teal-300">{t('shw.n948Optimal')}</span>
                </div>
              </HarmonizedSurface>

              {/* Azul Lavanda Sutil (Lavender Blue) */}
              <HarmonizedSurface
                variant={pastelFinish === 'glass' ? 'pastel-lavender' : 'card'}
                className={cn(
                  "p-5 rounded-2xl relative overflow-hidden transition-all duration-300",
                  pastelFinish === 'solid' && CLINICAL_PASTELS.lavender.solid,
                  activePastelDemo === 'lavender' && "ring-2 ring-indigo-400/60 shadow-card"
                )}
                interactive
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="size-11 rounded-xl bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold ring-2 ring-indigo-400/30">
                    <Sparkles className="size-5" />
                  </div>
                  <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300">
                    {t('shw.lavenderBlue')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-100 mb-1">
                  {t('shw.subtleLavenderBlue')}
                </h3>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80 mb-4 leading-relaxed">
                  {t('shw.designedForTeleRehab')}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-indigo-200/50 dark:border-indigo-500/20 text-xs font-semibold">
                  <span className="text-indigo-800 dark:text-indigo-200">{t('shw.guidedSessions')}</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-300">{t('shw.n18Completed')}</span>
                </div>
              </HarmonizedSurface>
            </div>

            {/* Fila 2: Comparativa Visual Directa "Antes vs Ahora" */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('shw.visualComparisonFlatGrayWhiteVsHarmonizedClinicalPas')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Antes: Blanco plano / gris aburrido */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-on-surface relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-on-surface-variant border border-slate-300 dark:border-slate-700">
                      {t('shw.previousStyleWhiteFlatGray')}
                    </span>
                    <span className="text-xs text-on-surface-variant">{t('shw.noTint')}</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface mb-1">
                    {t('shw.shoulderPosturalAssessment')}
                  </p>
                  <p className="text-xs text-on-surface-variant mb-4">
                    {t('shw.coldGenericContainerThatCausesVisualFatigueAndConvey')}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="size-2 rounded-full bg-slate-400" />
                    <span>{t('shw.n8RepsNoSensoryHighlight')}</span>
                  </div>
                </div>

                {/* Ahora: Harmonized Pastel con microgradiente y glow */}
                <HarmonizedSurface
                  variant="pastel-gradient"
                  interactive
                  className="p-5 rounded-2xl relative shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-800 dark:text-teal-200 border border-teal-500/30 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-teal-500 animate-pulse" />
                      {t('shw.evolvedPastelTrilateralGlass')}
                    </span>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{t('shw.aaaContrast')}</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface mb-1">
                    {t('shw.shoulderPosturalAssessment')}
                  </p>
                  <p className="text-xs text-on-surface mb-4 leading-relaxed">
                    {t('shw.clinicalElegance')}
                  </p>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-teal-800 dark:text-teal-200 flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-teal-500" />
                      {t('shw.n8PerfectReps')}
                    </span>
                    <span className="font-mono text-teal-700 dark:text-teal-300 font-black">{t('shw.n985Score')}</span>
                  </div>
                </HarmonizedSurface>
              </div>
            </div>

            {/* Fila 3: Semáforos Biomecánicos & Badges Pastel */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                {t('shw.biomechanicalTrafficLightsBadgesWithPastelAccents')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-teal-50/90 dark:bg-teal-950/35 border border-teal-200/80 dark:border-teal-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">{t('shw.biomechanics')}</span>
                    <p className="text-xs font-bold text-teal-950 dark:text-teal-100">{t('shw.safeRange')}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50/90 dark:bg-sky-950/35 border border-sky-200/80 dark:border-sky-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">{t('shw.telemetry')}</span>
                    <p className="text-xs font-bold text-sky-950 dark:text-sky-100">{t('shw.tracking60Fps')}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/35 border border-amber-200/80 dark:border-amber-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">{t('shw.compensation')}</span>
                    <p className="text-xs font-bold text-amber-950 dark:text-amber-100">{t('shw.shoulderElevation')}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/35 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <span className="text-2xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">{t('shw.aiIntelligence')}</span>
                    <p className="text-xs font-bold text-indigo-950 dark:text-indigo-100">{t('shw.predictivePhysi')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN ESPECIAL: LOS 30 COMPONENTES PREVIOS
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'solicitados') && (
          <section className="space-y-8 p-6 sm:p-8 rounded-3xl bg-teal-500/5 border border-teal-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-teal-500/15">
              <div>
                <span className="text-2xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  {t('shw.integratedSuite')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface mt-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  {t('shw.the12RequestedComponentsWithFisiomirrorTheme')}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {t('shw.functionalImplementation')}
                </p>
              </div>
            </div>

            {/* 1. Tarjeta de Reportes con Gráficos Reaviz */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                  {t('shw.n1IncidentReportCard')}
                </h3>
              </div>
              <div className="flex justify-center sm:justify-start">
                <IncidentReportCard />
              </div>
            </div>

            {/* 2. Tarjetas de Asignación y Progreso */}
            <div className="space-y-3 pt-6 border-t border-teal-500/15">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                  {t('shw.n2AssignmentProgressCards')}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleRoutineCards.map((cardData) => (
                  <AssignmentProgressCard key={cardData.id} data={cardData} />
                ))}
              </div>
            </div>

            {/* 3 & 4. Sistema de Alertas HeroUI y AlertDialog */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 3. Alertas HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n3HerouiAlertSystem')}
                  </h3>
                </div>
                <BasicAlertsDemo />
              </div>

              {/* 4. AlertDialog HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n4AlertDialogs')}
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-[calc(100%-2rem)]">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      {t('shw.criticalConfirmationModal')}
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                      Sustituye llamadas estándar <code className="text-rose-500 font-mono">window.confirm</code> por un diálogo con backdrop difuminado, spring physics y confirmación accesible.
                    </p>
                  </div>
                  <div>
                    <DeleteProjectDialogDemo />
                  </div>
                </div>
              </div>
            </div>

            {/* 5 & 6. Avatares y Banner Promocional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 5. Avatares HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n5UserAvatarsFallback')}
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <AvatarDemo />
                </div>
              </div>

              {/* 6. Promo Card Banner HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n6MediaBannerCard')}
                  </h3>
                </div>
                <PromoCardDemo onCtaClick={() => navigate('/ocr-scanner')} />
              </div>
            </div>

            {/* 7 & 8. Checkbox Preferences y Chips de Estado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 7. Checkbox HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n7CheckboxGroups')}
                  </h3>
                </div>
                <CheckboxPreferencesDemo />
              </div>

              {/* 8. Chip HeroUI */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n8StatusChips')}
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <p className="text-xs text-on-surface-variant">
                    {t('shw.patientStatusAndClinicalSeverityTrafficLight')}
                  </p>
                  <ChipStatusesDemo />
                </div>
              </div>
            </div>

            {/* 9 & 10. Modal Interactivo y Popover Biomecánico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 9. Ventana Modal Interactiva (Modal) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n9InteractiveModal')}
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      {t('shw.calibrationAndModalConfiguration')}
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                      Ventana emergente accesible con física de muelle, disparador de cierre automático (slot=&quot;close&quot;), selector de sensibilidad y mallas AR.
                    </p>
                  </div>
                  <CustomModalDemo />
                </div>
              </div>

              {/* 10. Menú Desplegable Contextual (Popover) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n10ContextMenuPopover')}
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      {t('shw.dynamicBiomechanicalDetail')}
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                      {t('shw.anchoredBoxDescription')}
                    </p>
                  </div>
                  <PopoverMetricDemo />
                </div>
              </div>
            </div>

            {/* 11 & 12. Drawer Clínico y Selector de Rango de Fechas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
              {/* 11. Panel Lateral Deslizante (Drawer) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n11SlidingDrawer')}
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      {t('shw.sessionSettingsSidePanel')}
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                      {t('shw.slidingDrawerDescription')}
                    </p>
                  </div>
                  <DrawerClinicalDemo />
                </div>
              </div>

              {/* 12. Selector de Rango de Fechas (DateRangePicker) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.n12DateRangePicker')}
                  </h3>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface mb-1">
                      {t('shw.clinicalIntervalCalendar')}
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                      {t('shw.dateRangeDescription')}
                    </p>
                  </div>
                  <DateRangePickerDemo />
                </div>
              </div>
            </div>

            {/* 13, 14 & 15. Calendarios de Rango Avanzados, ScrollShadow, Skeleton y Toast System */}
            <div className="pt-6 border-t border-teal-500/15 space-y-6">
              {/* Calendarios Avanzados: Basic, WeekView y DefaultValue */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                    {t('shw.advancedRangeCalendars')}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Vista Básica */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        {t('shw.n1BasicView')}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-1 mb-1">
                        firstDayOfWeek=&quot;mon&quot;
                      </h4>
                      <p className="text-xs text-on-surface-variant mb-3">
                        {t('shw.headingsNavbuttonsGrid')}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <BasicRangeCalendar />
                    </div>
                  </div>

                  {/* Vista Dinámica por Semanas */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        {t('shw.n2WeekView')}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-1 mb-1">
                        {t('shw.dynamicVisibleduration')}
                      </h4>
                      <p className="text-xs text-on-surface-variant mb-3">
                        {t('shw.herouiSelectPickerThatExpandsOrContractsTheViewFrom1')}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <WeekViewRangeCalendar />
                    </div>
                  </div>

                  {/* Vista Predeterminada */}
                  <div className="p-5 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-2xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-md">
                        {t('shw.n3InitialRange')}
                      </span>
                      <h4 className="text-sm font-bold text-on-surface mt-1 mb-1">
                        parseDate(&quot;2026-02-03&quot;)
                      </h4>
                      <p className="text-xs text-on-surface-variant mb-3">
                        {t('shw.directLoadingOfAPreSelectedMedicalIntervalWithClinic')}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <DefaultValueRangeCalendar />
                    </div>
                  </div>
                </div>
              </div>

              {/* ScrollShadow & Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* ScrollShadow */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.scrollOverflowShadows')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.containerWithAutomaticGradients')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        {t('shw.scrollTheRehabilitationExerciseListTheTopAndBottomSh')}
                      </p>
                    </div>
                    <ScrollShadow className="h-60 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-3 bg-slate-50/50 dark:bg-slate-900/50" size={36}>
                      <div className="space-y-2.5">
                        {[
                          { name: t('shw.assistedBiomechanicalSquat'), reps: t('shw.n3Sets12Reps'), target: t('shw.kneeAndQuadriceps'), status: t('shw.completed') },
                          { name: t('shw.bandedShoulderExternalRotation'), reps: t('shw.n3Sets15Reps'), target: t('shw.rotatorCuff'), status: t('shw.inProgress') },
                          { name: t('shw.gluteBridgeWithLumbarDecompression'), reps: t('shw.n4Sets10Reps'), target: t('shw.coreAndSpine'), status: t('shw.pending') },
                          { name: t('shw.stepEdgePlantarFlexion'), reps: t('shw.n3Sets15Reps'), target: t('shw.achillesTendon'), status: t('shw.pending') },
                          { name: t('shw.lateralScapularElevation'), reps: t('shw.n3Sets12Reps'), target: t('shw.middleTrapezius'), status: t('shw.pending') },
                          { name: t('shw.dynamicHamstringStretch'), reps: t('shw.n2Sets30Sec'), target: t('shw.posteriorChain'), status: t('shw.completed') },
                          { name: t('shw.singleLegBalanceOnAirDisc'), reps: t('shw.n3Sets45Sec'), target: t('shw.proprioception'), status: t('shw.pending') }
                        ].map((ex, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between shadow-xs">
                            <div>
                              <p className="text-xs font-bold text-on-surface">{ex.name}</p>
                              <p className="text-xs text-on-surface-variant">{ex.target} • {ex.reps}</p>
                            </div>
                            <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                              {ex.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollShadow>
                  </div>
                </div>

                {/* Skeleton y Toast */}
                <div className="space-y-6">
                  {/* Skeleton */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        {t('shw.progressiveLoadingPlaceholders')}
                      </h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-on-surface mb-1">
                          {t('shw.shimmerWaveAnimationWithoutFlicker')}
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                          {t('shw.keepsTheLayoutStructureIntactWhileLidarOrCameraSenso')}
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton variant="circle" width={44} height={44} />
                          <div className="flex-1 space-y-2">
                            <Skeleton variant="text" width="65%" height={14} />
                            <Skeleton variant="text" width="45%" height={11} />
                          </div>
                        </div>
                        <Skeleton variant="text" width="100%" height={12} />
                        <Skeleton variant="text" width="80%" height={12} />
                        <div className="flex gap-2 pt-1">
                          <Skeleton variant="rect" width={90} height={28} className="rounded-xl" />
                          <Skeleton variant="rect" width={90} height={28} className="rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toast Interactivo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        {t('shw.herouiSonnerToastNotifications')}
                      </h3>
                    </div>
                    <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                      <p className="text-xs text-on-surface-variant">
                        {t('shw.triggersDirectErgonomicNotificationsWithHapticFeedba')}
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => toast(t('shw.toastSessionStarted'))}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-on-surface hover:opacity-90 transition-opacity"
                        >
                          {t('shw.defaultToast')}
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.success(t('shw.toastAngleValidated'), { description: t('shw.toastRecordedInHistory') })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                        >
                          {t('shw.clinicalSuccess')}
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.warning(t('shw.toastPosturalCompensation'), { description: t('shw.toastHipExceedsLimit') })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                        >
                          {t('shw.biomechanicalAlert')}
                        </button>
                        <button
                          type="button"
                          onClick={() => toast.error(t('shw.toastCameraSensorError'), {
                            action: { label: t('shw.retry'), onClick: () => toast.info(t('shw.retryingConnection')) }
                          })}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors"
                        >
                          {t('shw.errorWithAction')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 16 & 17. Feed Animado en Vivo (AnimatedList) y Cañones Laterales (ConfettiSideCannons) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 border-t border-teal-500/15">
                {/* 16. AnimatedList */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n16LiveClinicalFeed')}
                    </h3>
                  </div>
                  <ClinicalActivityFeed delay={2800} />
                </div>

                {/* 17. ConfettiSideCannons */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n17ConfettiSideCannons')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between h-[calc(100%-2rem)]">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.continuousBidirectionalFestiveEffect')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        {t('shw.firesConfettiBurstsAt60And120FromBothEndsOfTheScreen')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <ConfettiSideCannons
                        className="w-full sm:w-auto"
                        onClick={() => toast.success(t('shw.toastWeeklyGoalExceeded'), { description: t('shw.toastCelebratingProgress') })}
                      >
                        {t('shw.triggerCelebrationCannons')}
                      </ConfettiSideCannons>
                      <ConfettiStars
                        className="w-full sm:w-auto text-xs"
                        onClick={() => toast.info(t('shw.toastAchievementStars'), { description: t('shw.toastGamifiedReward') })}
                      >
                        {t('shw.achievementStars')}
                      </ConfettiStars>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  18 & 19. HIGHLIGHTER & INTERACTIVE HOVER BUTTON
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 18. Highlighter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n18DynamicTextHighlighterTitle')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-on-surface-variant">
                        {t('shw.animatedOrganicRoughNotationStrokes')}
                      </p>
                      <button
                        type="button"
                        onClick={() => setHighlighterKey((k) => k + 1)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="size-3" /> Reanimar trazo
                      </button>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex flex-wrap gap-1.5">
                      {(['highlight', 'underline', 'box', 'circle', 'bracket', 'strike-through'] as AnnotationAction[]).map((act) => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => {
                            setHighlighterAction(act);
                            setHighlighterKey((k) => k + 1);
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize",
                            highlighterAction === act
                              ? "bg-primary text-on-primary shadow-xs"
                              : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest"
                          )}
                        >
                          {act}
                        </button>
                      ))}
                    </div>

                    {/* Preview Paragraph */}
                    <div className="p-4 rounded-2xl bg-surface-container-low/50 dark:bg-slate-900/50 border border-outline-variant/20 text-sm text-on-surface leading-relaxed">
                      {t('shw.patientCarlosPresents')}{" "}
                      <Highlighter
                        key={`hl-${highlighterKey}-${highlighterAction}`}
                        action={highlighterAction}
                        color="rgba(76, 218, 210, 0.45)"
                        strokeWidth={2}
                      >
                        {t('shw.pelvicCompensationAt14')}
                      </Highlighter>{" "}
                      {t('shw.duringFlexionPhaseRequiring')}{" "}
                      <ClinicalHighlighter variant="warning" action="underline">
                        {t('shw.activeCoreStabilization')}
                      </ClinicalHighlighter>{" "}
                      {t('shw.toPreventLumbosacralRecurrence')}
                    </div>
                  </div>
                </div>

                {/* 19. InteractiveHoverButton */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n19InteractiveHoverButton')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between h-[calc(100%-2rem)]">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.radialSlideMicrointeraction')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        {t('shw.interactiveHoverButtonDescription')}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
                      <InteractiveHoverButton
                        onClick={() => {
                          toast.success(t('shw.toastActionExecuted'), { description: t('shw.toastNavigatingToSession') });
                        }}
                      >
                        {t('shw.startArMirrorMode')}
                      </InteractiveHoverButton>

                      <InteractiveHoverButton
                        onClick={() => {
                          toast.info(t('shw.toastRoutineSaved'), { description: t('shw.toastParamsSynced') });
                        }}
                        className="border-emerald-500/40"
                      >
                        {t('shw.savePrescription')}
                      </InteractiveHoverButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  20 & 21. KINETIC TEXT & LIGHT RAYS
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 20. KineticText */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n20KineticText')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.proximityBasedTypographicWeightDeformation')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        {t('shw.hoverLetterByLetterToSeeHowFontWeightChangesOrganica')}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-surface-container-low/50 dark:bg-slate-900/50 border border-outline-variant/20 flex flex-col justify-center min-h-[90px]">
                      <KineticText
                        text={kineticInputText}
                        as="h2"
                        className="text-2xl sm:text-3xl font-light text-primary dark:text-teal-300"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={kineticInputText}
                        onChange={(e) => setKineticInputText(e.target.value)}
                        placeholder={t('shw.typeAText')}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-outline-variant/30 bg-surface dark:bg-slate-900 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setKineticInputText(t('shw.fisiomirrorBiomechanics'))}
                        className="text-xs font-semibold text-primary hover:underline px-2"
                      >
                        {t('shw.reset')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 21. LightRays */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n21LightRays')}
                    </h3>
                  </div>
                  <div className="relative h-64 rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#002724] border border-slate-800 shadow-card p-6 flex flex-col justify-between">
                    <LightRays
                      count={8}
                      color="rgba(76, 218, 210, 0.35)"
                      blur={32}
                      speed={10}
                      length="80%"
                    />
                    <div className="relative z-10">
                      <span className="text-2xs font-bold uppercase tracking-widest text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded-md border border-teal-500/30">
                        {t('shw.dynamicEnvironment')}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2">
                        {t('shw.holographicLightingBackground')}
                      </h4>
                      <p className="text-xs text-slate-300 max-w-sm mt-1">
                        {t('shw.lightRaysDescription')}
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center justify-between text-xs text-teal-200/80">
                      <span>{t('shw.cycle10sBlur32px')}</span>
                      <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-teal-400 animate-ping" />
                        {t('shw.active')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  22 & 23. NUMBER TICKER & MAGIC CARD
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 22. NumberTicker */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n22NumberTicker')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.springPhysicsWithoutAbruptJumps')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        {t('shw.changeTheNumericValuesAndWatchTheElasticTransitionVi')}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
                        <p className="text-2xs uppercase font-semibold text-on-surface-variant">{t('shw.romAngle')}</p>
                        <p className="text-2xl font-bold text-primary mt-1">
                          <NumberTicker value={tickerRomValue} suffix="°" />
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
                        <p className="text-2xs uppercase font-semibold text-on-surface-variant">{t('shw.adherence')}</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                          <NumberTicker value={Math.min(100, Math.round(tickerRomValue * 0.72))} suffix="%" />
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
                        <p className="text-2xs uppercase font-semibold text-on-surface-variant">{t('shw.patients')}</p>
                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                          <NumberTicker value={Math.round(tickerRomValue / 5)} />
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setTickerRomValue((v) => Math.max(45, v - 15))}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        -15° ROM
                      </button>
                      <button
                        type="button"
                        onClick={() => setTickerRomValue(140)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-all"
                      >
                        {t('shw.reset140')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTickerRomValue((v) => Math.min(180, v + 15))}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-outline-variant/30 text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        +15° ROM
                      </button>
                    </div>
                  </div>
                </div>

                {/* 23. MagicCard */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n23MagicCard')}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-on-surface-variant">
                        {t('shw.moveTheCursorInsideTheCard')}
                      </p>
                      <div className="flex items-center gap-1 bg-surface-container-high/60 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setMagicCardMode('gradient')}
                          className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                            magicCardMode === 'gradient' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                          )}
                        >
                          {t('shw.gradientMode')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMagicCardMode('orb')}
                          className={cn(
                            "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                            magicCardMode === 'orb' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                          )}
                        >
                          {t('shw.orbMode')}
                        </button>
                      </div>
                    </div>

                    <MagicCard
                      mode={magicCardMode}
                      gradientFrom="#006965"
                      gradientTo="#4cdad2"
                      glowFrom="#006965"
                      glowTo="#c1ff72"
                      className="cursor-pointer"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                            {t('shw.biomechanicalSensor')}
                          </span>
                          <span className="text-xs font-bold text-emerald-500">{t('shw.connected')}</span>
                        </div>
                        <h4 className="text-base font-bold text-on-surface">
                          {t('shw.realTimeLumbarAssessment')}
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {t('shw.kineticTrackingViaDepthSensorAndComputerVisionTheGra')}
                        </p>
                        <div className="pt-2 flex items-center justify-between text-xs font-semibold text-primary">
                          <span>{t('shw.currentMode')} {magicCardMode.toUpperCase()}</span>
                          <ArrowRight className="size-4" />
                        </div>
                      </div>
                    </MagicCard>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  24. PIXEL IMAGE
                  ───────────────────────────────────────────────────────── */}
              <div className="pt-6 border-t border-teal-500/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n24PixelImage')}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['6x4', '8x8', '8x3'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setPixelGridKey(g);
                          setPixelReplayKey((k) => k + 1);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                          pixelGridKey === g
                            ? "bg-primary text-on-primary shadow-xs"
                            : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPixelReplayKey((k) => k + 1)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25 transition-colors"
                    >
                      <RefreshCw className="size-3" /> Replay
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-center">
                  <PixelImage
                    key={`pixel-${pixelReplayKey}-${pixelGridKey}`}
                    src="/physi.png"
                    alt="Physi IA Mascot"
                    grid={pixelGridKey}
                    grayscaleAnimation={true}
                    pixelFadeInDuration={800}
                    maxAnimationDelay={1000}
                    colorRevealDelay={1100}
                    className="h-60 w-60 md:h-72 md:w-72 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center p-4"
                  />
                  <div className="max-w-md space-y-3">
                    <span className="text-2xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md">
                      {t('shw.digitalEntryEffect')}
                    </span>
                    <h4 className="text-lg font-bold text-on-surface">
                      {t('shw.staggeredAppearanceWithClipPathPolygons')}
                    </h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {t('shw.pixelGridParagraph', { grid: pixelGridKey })}
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 text-xs text-on-surface-variant">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20">
                        {t('shw.gridLabel')} {pixelGridKey}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20">
                        {t('shw.transition800ms')}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20">
                        {t('shw.filterGrayscaleColor')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  25 & 26. PULSATING BUTTON & SCROLL PROGRESS
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 25. PulsatingButton */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        {t('shw.n25PulsatingButton')}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-high/60 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPulsatingVariant('pulse')}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                          pulsatingVariant === 'pulse' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        {t('shw.pulse')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPulsatingVariant('ripple')}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all",
                          pulsatingVariant === 'ripple' ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        {t('shw.ripple')}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.criticalCallToActionWithFrequencyWaves')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        {t('shw.emitsPulseRingsOrContinuousWaveExpansionsInstantlyId')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <PulsatingButton
                        variant={pulsatingVariant}
                        pulseColor={pulsatingColor}
                        onClick={() => toast.success(t('shw.toastCalibrationStarted'), { description: t('shw.toastActivatingMediapipe') })}
                        className="text-xs"
                      >
                        <Activity className="size-4" />
                        <span>{t('shw.calibrateMediapipeCamera')}</span>
                      </PulsatingButton>

                      <PulsatingButton
                        variant={pulsatingVariant}
                        pulseColor="#06b6d4"
                        onClick={() => navigate('/ar-mirror')}
                        className="bg-cyan-600 hover:bg-cyan-500 text-xs"
                      >
                        <Zap className="size-4" />
                        <span>{t('shw.startArMirror2')}</span>
                      </PulsatingButton>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-xs text-on-surface-variant">
                      <span>{t('shw.pulseColor')}</span>
                      <button
                        type="button"
                        onClick={() => setPulsatingColor('rgba(13, 148, 136, 0.6)')}
                        className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                      >
                        {t('shw.medicalTeal')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPulsatingColor('rgba(193, 255, 114, 0.7)')}
                        className="px-2 py-0.5 rounded-md bg-lime-500/10 text-lime-700 dark:text-lime-400 border border-lime-500/20"
                      >
                        {t('shw.kineticLime')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPulsatingColor('rgba(59, 130, 246, 0.6)')}
                        className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      >
                        {t('shw.azureBlue')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 26. ScrollProgress */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n26ScrollProgress')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.dynamicScrollReadingWithGpuScale')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        {t('shw.lookAtTheContinuousLineAtTheFixedTopOfThisPageItUpda')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                        <span>{t('shw.gradient2')}</span>
                        <code className="text-xs text-teal-600 dark:text-teal-400 font-mono">
                          from-teal-600 via-cyan-400 to-[#c1ff72]
                        </code>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gradient-to-r from-teal-600 via-cyan-400 to-[#c1ff72] shadow-sm shadow-teal-500/20" />
                      <p className="text-xs text-on-surface-variant leading-normal">
                        {t('shw.enableItOnAllClinicalScreensSoThePatientOrTherapistC')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  27 & 28. SHIMMER BUTTON & SHINE BORDER
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 27. ShimmerButton */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n27ShimmerButton')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.continuousConicRotation')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        {t('shw.peripheralShineDescription')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <ShimmerButton
                        shimmerColor="#c1ff72"
                        background="rgba(0, 50, 48, 0.95)"
                        onClick={() => toast.success(t('shw.toastReportGenerated'), { description: t('shw.toastAiAnalysisProcessed') })}
                        className="text-xs"
                      >
                        <Sparkles className="size-4 text-kinetic" />
                        <span>{t('shw.generatePhysiAiReport')}</span>
                      </ShimmerButton>

                      <ShimmerButton
                        shimmerColor="#38bdf8"
                        background="rgba(15, 23, 42, 0.95)"
                        onClick={() => toast.info(t('shw.toastExportingHistory'), { description: t('shw.toastPreparingPdf') })}
                        className="text-xs border-slate-700"
                      >
                        <Copy className="size-4" />
                        <span>{t('shw.exportHistoryPdf')}</span>
                      </ShimmerButton>
                    </div>
                  </div>
                </div>

                {/* 28. ShineBorder */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n28ShineBorder')}
                    </h3>
                  </div>
                  <div className="relative p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 overflow-hidden">
                    <ShineBorder
                      borderWidth={2}
                      duration={10}
                      shineColor={["#00504d", "#14b8a6", "#c1ff72"]}
                    />
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-on-surface">
                          {t('shw.clinicalCardWithMulticolorOrbitBorder')}
                        </h4>
                        <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {t('shw.highPriority')}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                        {t('shw.theAnimatedRadialGradientTravelsAcrossAll4CornersWit')}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-on-surface">{t('shw.patientRobertoSantana')}</p>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{t('shw.patellarTendinopathySession6Of12')}</p>
                      </div>
                      <span className="text-xs font-black text-on-surface">{t('shw.n125Flexion')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  29 & 30. SPARKLES TEXT & TEXT ANIMATE
                  ───────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-teal-500/15">
                {/* 29. SparklesText */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                      {t('shw.n29SparklesText')}
                    </h3>
                  </div>
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        {t('shw.vectorFestiveStarsAndSparkles')}
                      </h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                        {t('shw.sparklesDescription')}
                      </p>
                    </div>

                    <div className="py-2">
                      <SparklesText
                        sparklesCount={8}
                        colors={{ first: '#0d9488', second: '#c1ff72' }}
                        className="text-2xl sm:text-3xl text-on-surface"
                      >
                        {sparklesWord}
                      </SparklesText>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={sparklesWord}
                        onChange={(e) => setSparklesWord(e.target.value)}
                        placeholder={t('shw.typeAnAchievementMessage')}
                        className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-on-surface focus:outline-hidden focus:border-teal-500"
                      />
                      <button
                        type="button"
                        onClick={() => setSparklesWord(t('shw.n100RangeOfMotionExceeded'))}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-teal-500/15 text-teal-600 dark:text-teal-400 hover:bg-teal-500/25 transition-colors whitespace-nowrap"
                      >
                        {t('shw.clinicalExample')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 30. TextAnimate */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface">
                        {t('shw.n30TextAnimate')}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTextAnimateKey((k) => k + 1)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="size-3" /> Reanimar
                    </button>
                  </div>

                  <div className="p-6 rounded-3xl bg-white dark:bg-[#0e141d] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-on-surface-variant">{t('shw.variant')}</span>
                      {(['blurInUp', 'fadeIn', 'slideUp', 'scaleUp', 'blurIn'] as AnimationVariant[]).map((anim) => (
                        <button
                          key={anim}
                          type="button"
                          onClick={() => {
                            setTextAnimateVariant(anim);
                            setTextAnimateKey((k) => k + 1);
                          }}
                          className={cn(
                            "px-2 py-0.5 text-2xs font-bold rounded-md transition-all",
                            textAnimateVariant === anim
                              ? "bg-primary text-on-primary shadow-xs"
                              : "bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest"
                          )}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span>{t('shw.segmentation')}</span>
                      {(['word', 'character', 'line'] as AnimationType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setTextAnimateType(type);
                            setTextAnimateKey((k) => k + 1);
                          }}
                          className={cn(
                            "px-2 py-0.5 text-2xs font-bold rounded-md transition-all",
                            textAnimateType === type
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-low text-on-surface-variant"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-slate-900/60 border border-teal-500/20 min-h-[90px] flex items-center">
                      <TextAnimate
                        key={`text-anim-${textAnimateKey}-${textAnimateVariant}-${textAnimateType}`}
                        animation={textAnimateVariant}
                        by={textAnimateType}
                        className="text-sm sm:text-base font-bold text-on-surface leading-relaxed"
                      >
                        {t('shw.biomechanicalAssessmentAssistedByPhysiAiScapularSymm')}
                      </TextAnimate>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN INVENTARIO & COMPARATIVA
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'comparativa') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  {t('shw.fullInventoryOriginalComponentsVsEvolvedVersions')}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {t('shw.directComponentMapping')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INVENTORY_COMPARISONS.map((item, index) => (
                <Card key={index} variant="glass" hoverEffect animated className="relative overflow-hidden">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-2xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                      {t(item.category)}
                    </span>
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {t('shw.sourceLabel')} {item.librarySource}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="p-2 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-2xs uppercase font-bold text-on-surface-variant">{t('shw.originalComponentInFisiomirror')}</p>
                      <p className="text-xs font-semibold text-on-surface">{t(item.originalComponent)}</p>
                      <code className="text-2xs text-on-surface-variant font-mono">{item.originalFile}</code>
                    </div>

                    <div className="p-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-500/20">
                      <p className="text-2xs uppercase font-bold text-teal-600 dark:text-teal-400">{t('shw.integratedEvolvedVersion')}</p>
                      <p className="text-xs font-bold text-on-surface">{t(item.evolvedComponent)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-on-surface-variant mb-1.5">{t('shw.advantagesAndSuperiorFeatures')}</p>
                    <ul className="space-y-1">
                      {item.keyImprovements.map((improvement, i) => (
                        <li key={i} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                          <span>{t(improvement)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN BOTONES EVOLVED (Magic UI, 21st.dev, Shadcn CVA)
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'botones') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  {t('shw.evolvedButtonsHeader')}
                </h2>
                <p className="text-xs text-on-surface-variant">
                  {t('shw.replacesFlatButtonsWithSpringMicrointeractionsAndRot')}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setButtonLoading(!buttonLoading)}
                className="text-xs"
              >
                {t('shw.toggleLoading')} {buttonLoading ? t('shw.enabled') : t('shw.disabled')}
              </Button>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center gap-2">
                  <span>{t('shw.componentVariants')}</span>
                  <span className="text-2xs text-teal-500 lowercase">(framer-motion + cva + magic-ui)</span>
                </h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <ShimmerButton>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Shimmer Button (Magic UI)</span>
                  </ShimmerButton>

                  <Button variant="glow" glowEffect icon={<Sparkles className="w-4 h-4" />}>
                    {t('shw.buttonGlowInfinite')}
                  </Button>

                  <Button variant="kinetic" glowEffect icon={<Activity className="w-4 h-4" />}>
                    {t('shw.buttonKineticHighFrequency')}
                  </Button>

                  <Button variant="glass">Button Glass Effect</Button>
                  <Button variant="gradient" icon={<Zap className="w-4 h-4" />}>{t('shw.gradient3')}</Button>
                  <Button variant="default" loading={buttonLoading}>Default CVA</Button>
                  <Button variant="secondary">{t('shw.secondary')}</Button>
                  <Button variant="outline">{t('shw.outline')}</Button>
                  <Button variant="destructive" icon={<Trash2 className="w-4 h-4" />}>{t('shw.destructive')}</Button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">{t('shw.scalesUtilityButtons')}</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm" variant="glow">{t('shw.smallSm')}</Button>
                  <Button size="default" variant="glow">{t('shw.normalDefault')}</Button>
                  <Button size="lg" variant="glow" icon={<Send className="w-5 h-5" />} iconPosition="right">
                    {t('shw.largeTactileLg')}
                  </Button>
                  <Tooltip content={t('shw.accessibleIconbuttonForNavigation')}>
                    <IconButton icon={<Heart className="w-4 h-4 text-rose-500" />} />
                  </Tooltip>
                  <BackButton onClick={() => toast.info(t('shw.navigationSimulationGoingBackToThePreviousScreen'))}>{t('shw.backbuttonBack')}</BackButton>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN TARJETAS, SPOTLIGHT & BENTO (Aceternity UI & Magic UI)
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'tarjetas') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {t('shw.activeCardsCardspotlightBento')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('shw.moveTheMouseOverTheCardsToAppreciateTheMathematicalR')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <CardSpotlight className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <MousePointer className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-2xs font-bold text-teal-600 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                    Aceternity Spotlight
                  </span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">
                  {t('shw.reactiveCardspotlight')}
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  {t('shw.projectsADynamicMathematicalRadialGradientThatFollow')}
                </p>
                <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant">{t('shw.biomechanicalEffect')}</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">{t('shw.smooth60Fps')}</span>
                </div>
              </CardSpotlight>

              <div className="relative p-6 rounded-2xl border border-outline/15 bg-surface-container-low/70 overflow-hidden group shadow-sm flex flex-col justify-between">
                <BorderBeam size={90} duration={6} colorFrom="#14b8a6" colorTo="#C1FF72" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-lime-500/10 text-lime-600 dark:text-lime-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-2xs font-bold text-lime-600 bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/20">
                      Magic UI BorderBeam
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-1">
                    {t('shw.kineticOrbitalBorder')}
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                    {t('shw.anSvgLightBeamConstantlyTravelsTheCardsPerimeterToHi')}
                  </p>
                </div>
                <Button size="sm" variant="kinetic" className="w-full">
                  {t('shw.viewActiveModule')}
                </Button>
              </div>

              <StatCard 
                icon={
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Activity className="w-6 h-6" />
                  </div>
                }
                value={
                  <div className="flex items-center justify-center gap-1">
                    <NumberTicker value={89} key={tickerTrigger} />
                    <span>%</span>
                  </div>
                }
                label={t('shw.averageWeeklyAdherence')}
                trend={
                  <span 
                    onClick={() => setTickerTrigger((prev) => prev + 1)}
                    className="cursor-pointer underline decoration-dotted hover:opacity-80"
                  >
                    {t('shw.n14PercentVsPreviousMonth')}
                  </span>
                }
              />
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN MODALES & DIÁLOGOS GLASS
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'modales') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {t('shw.evolvedModalsHeader')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('shw.replacesRigidWindowsWithFluidSpringTransitionsAndOpt')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center">
              <Button 
                variant="outline" 
                onClick={() => { setDialogSize('sm'); setDialogOpen(true); }}
              >
                {t('shw.openSmallModalSm')}
              </Button>
              <Button 
                variant="glass" 
                onClick={() => { setDialogSize('md'); setDialogOpen(true); }}
              >
                {t('shw.openMediumGlassModalMd')}
              </Button>
              <Button 
                variant="glow" 
                onClick={() => { setDialogSize('lg'); setDialogOpen(true); }}
              >
                {t('shw.openLargeClinicalModalLg')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setConfirmOpen(true)}
              >
                {t('shw.tryDestructiveConfirmdialog')}
              </Button>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN INPUTS & OTP
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'entradas') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                {t('shw.clinicalInputsOtpinput')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('shw.formsWithFocusMicroScalingAnd6BoxSegmentedInputForPa')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-on-surface">
                  {t('shw.clinicalFieldMicroZoom')}
                </h3>
                <Input 
                  label={t('shw.patientNameOrDiagnosis')} 
                  placeholder={t('shw.eGMariaFernandezTendinopathy')} 
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value.length > 0 && e.target.value.length < 3) {
                      setInputError(t('shw.theFieldMustHaveAtLeast3Characters'));
                    } else {
                      setInputError('');
                    }
                  }}
                  error={inputError}
                  hint={t('shw.softFocusWithMedicalTealHighlight')}
                  glassEffect={inputGlass}
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setInputGlass(!inputGlass)}
                  >
                    {t('shw.glassEffect')} {inputGlass ? t('shw.enabled2') : t('shw.disabled2')}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-on-surface">
                    {t('shw.n6BoxOtpInput')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setOtpValue('492815');
                        setOtpCompletedCode('492815');
                      }}
                      className="text-xs"
                    >
                      {t('shw.tryPasteDemo')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setOtpError(!otpError)}
                      className="text-xs"
                    >
                      {t('shw.errorLabel')} {otpError ? t('common.yes') : t('common.no')}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant">
                  {t('shw.pasteOrTypeATokenItJumpsBetweenBoxesAutomaticallyWit')}
                </p>
                
                <div className="flex justify-center sm:justify-start">
                  <OtpInput 
                    length={6}
                    value={otpValue}
                    onChange={setOtpValue}
                    onComplete={(code) => setOtpCompletedCode(code)}
                    error={otpError}
                  />
                </div>

                {otpCompletedCode && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{t('shw.codeDetectedAndValidatedInRealTime')} <strong>{otpCompletedCode}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN CONTROLES CLÍNICOS HÁPTICOS (ROM & DOLOR)
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'clinicos') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                {t('shw.hapticClinicalControls')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('shw.designedForBiomechanicalAngleCalibrationWithVisualMa')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <ClinicalSlider 
                value={clinicalRom}
                onChange={setClinicalRom}
                min={0}
                max={180}
                label={t('shw.kneeElbowFlexionRom')}
                unit="°"
                icon={<Activity className="w-5 h-5" />}
                ticks={[0, 45, 90, 135, 180]}
                helperText={t('shw.moveTheSliderToCalibrateTheGuidedSessionsThresholdAn')}
              />

              <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>
                    Ángulo seleccionado actual: <strong className="text-sm font-bold text-teal-700 dark:text-teal-300">{clinicalRom}°</strong>
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setClinicalRom(90)}>{t('shw.preset90Functional')}</Button>
                  <Button size="sm" variant="glow" onClick={() => setClinicalRom(135)}>{t('shw.preset135Advanced')}</Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SECCIÓN TIPOGRAFÍA LUMÍNICA & TOOLTIPS
            ───────────────────────────────────────────────────────────── */}
        {(activeTab === 'todos' || activeTab === 'luces') && (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {t('shw.luminousTypographyTooltips')}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {t('shw.textWithALivingOrganicGradientFlowAndTooltipsIn4Orie')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant">{t('shw.dynamicTypography')}</span>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">{t('shw.auroraTextEffect')}</p>
                  <h3 className="text-2xl font-black">
                    Rehabilitación con <AuroraText>{t('shw.artificialIntelligence')}</AuroraText>
                  </h3>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-on-surface-variant mb-1">{t('shw.shimmerTextEffectSweep')}</p>
                  <ShimmerText text={t('shw.realTimeBiomechanicalAnalysisAt30Fps')} className="text-lg font-bold" />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-2xs uppercase font-bold tracking-wider text-on-surface-variant block mb-2">
                    {t('shw.tooltipsWithGeometricArrow')}
                  </span>
                  <p className="text-xs text-on-surface-variant mb-4">
                    {t('shw.hoverToSeeThePositioningAndTheAlignedMicroArrow')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Tooltip content={t('shw.topTooltipWithGlassEffect')} side="top">
                    <Button variant="outline" size="sm" className="w-full">{t('shw.top')}</Button>
                  </Tooltip>
                  <Tooltip content={t('shw.rightTooltipWithIntegratedArrow')} side="right">
                    <Button variant="glass" size="sm" className="w-full">{t('shw.right')}</Button>
                  </Tooltip>
                  <Tooltip content={t('shw.bottomTooltipWithSoftDelay')} side="bottom">
                    <Button variant="glow" size="sm" className="w-full">{t('shw.bottom')}</Button>
                  </Tooltip>
                  <Tooltip content={t('shw.leftSideTooltip')} side="left">
                    <Button variant="kinetic" size="sm" className="w-full">{t('shw.left')}</Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ── MODALES INTERACTIVOS ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size={dialogSize} glassEffect>
        <DialogHeader>
          <DialogTitle>Modal Interactivo Glass ({dialogSize.toUpperCase()})</DialogTitle>
          <DialogDescription>
            {t('shw.dialogDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-3">
            <p className="text-xs text-on-surface-variant">
              {t('shw.inspiredByHerouiErgonomicsAndTeleRehabilitationModal')}
            </p>
            <Input 
              label={t('shw.testClinicalComment')} 
              placeholder={t('shw.writeAnObservationForThePatient')} 
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            {t('shw.close')}
          </Button>
          <Button variant="glow" glowEffect onClick={() => setDialogOpen(false)}>
            {t('shw.acceptChanges')}
          </Button>
        </DialogFooter>
      </Dialog>

      <ConfirmDialog 
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('shw.confirmDestructiveAction')}
        description={t('shw.thisIsAConfirmdialogDemoWithStyledVariantsAndOneTapC')}
        confirmText={t('shw.yesContinue')}
        cancelText={t('shw.goBack')}
        confirmVariant="destructive"
        onConfirm={() => setConfirmOpen(false)}
      />
    </div>
  );
}
export default UIShowcasePage;
