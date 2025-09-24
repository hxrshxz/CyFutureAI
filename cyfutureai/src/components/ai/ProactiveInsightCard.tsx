import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { AlertTriangle, Lightbulb } from "lucide-react";

const ProactiveInsightCard = () => {
  const criticalShifts = 1;
  const regionsMonitored = 10;
  const highestExtractionStage = "High";

  return (
    <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-slate-200/80 shadow-lg text-slate-900">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl text-slate-900">
              Proactive Financial Insights
            </h3>
            <p className="text-sm text-slate-500">Summary for Q3 2025</p>
          </div>
          <Badge className="bg-sky-100 text-sky-800">AI Generated</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs font-semibold text-slate-500">
              Critical Shifts
            </p>
            <p className="text-lg font-bold text-red-800 flex items-center justify-center gap-1">
              <AlertTriangle className="h-4 w-4" /> {criticalShifts}
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs font-semibold text-slate-500">
              Highest Stage
            </p>
            <p className="text-lg font-bold text-purple-800">
              {highestExtractionStage}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-500">
              Companies Analyzed
            </p>
            <p className="text-lg font-bold text-slate-800">
              {regionsMonitored}
            </p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" /> Key Observation
          </h4>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-700">
              The <strong>Tech</strong> sector has shown a consistent upward
              trend in revenue, moving it into the 'High Growth' category. This
              is correlated with an increase in urban usage, industrial demand,
              and below-average rainfall in the region.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProactiveInsightCard;
