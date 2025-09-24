import React from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { useInView, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

const AnimatedCounter = ({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  useEffect(() => {
    if (isInView) spring.set(value);
  }, [spring, value, isInView]);
  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (ref.current)
        ref.current.textContent = `${Number(
          latest.toFixed(0)
        ).toLocaleString()}${suffix}`;
    });
    return () => unsubscribe();
  }, [spring, suffix]);
  return <span ref={ref} />;
};

export const MemoizedStatCard = React.memo(({ stat }: { stat: any }) => (
  <Card className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl shadow-lg hover:shadow-xl transition-all h-full">
    <CardContent className="p-5 relative">
      <div className="flex items-center gap-4">
        <div
          className={`p-2 rounded-lg bg-gradient-to-br ${stat.iconColor
            .replace("text-", "from-")
            .replace("-500", "-400/20")} ${stat.iconColor
            .replace("text-", "to-")
            .replace("-500", "-500/20")}`}
        >
          <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">
            <AnimatedCounter value={stat.value} />
          </p>
          <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
        </div>
      </div>
      <Badge className="absolute top-4 right-4 bg-green-100 text-green-800 border-green-200 font-semibold">
        {stat.change}
      </Badge>
    </CardContent>
  </Card>
));
MemoizedStatCard.displayName = "MemoizedStatCard";
