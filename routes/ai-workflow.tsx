import { createFileRoute } from "@tanstack/react-router";

import { WorkflowPage } from "@/components/workflow/WorkflowPage";

const TITLE = "AI Workflow Sprint for Kenyan Businesses | VEXVANO LABS";
const DESCRIPTION =
  "Practical, human-led AI workflows for customer replies, quotes, content and reports. Audits from KES 3,000.";

export const Route = createFileRoute("/ai-workflow")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "VEXVANO AI Workflow Sprint" },
      {
        property: "og:description",
        content:
          "Make repetitive business work easier with practical AI for Kenyan small businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkflowPage,
});
