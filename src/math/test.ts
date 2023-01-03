import { Text } from "./types/MathNodeType";

// metric is a list of value-unit pair that separated by +
export const parseAdaptiveMetric = (metric: string) => {
  const metricList = metric.split('+').map(m => {
    const trimmed = m.trim();
    const regex = /^(\d*(\.\d*)?)\s*([a-zA-Z]*)$/

  });
}

