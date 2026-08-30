import { PhysiGuide, type PhysiGuideProps } from './PhysiGuide';

export type PhysiChatbotProps = PhysiGuideProps;

/**
 * PhysiChatbot wraps PhysiGuide to preserve full compatibility
 * with the original UI design and all current flows.
 */
export function PhysiChatbot(props: PhysiChatbotProps) {
  return <PhysiGuide {...props} />;
}

export { PhysiGuide };
export default PhysiChatbot;
