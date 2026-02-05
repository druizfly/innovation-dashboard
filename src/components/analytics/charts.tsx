"use client";

import type { PieLabelRenderProps } from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderKanban,
  Building2,
  AlertTriangle,
  Clock,
  Radar,
  BookOpen,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  idea: "#3b82f6",
  development: "#f59e0b",
  pilot: "#14b8a6",
};

const DECISION_COLORS: Record<string, string> = {
  advance: "#10b981",
  consolidate: "#f97316",
  pause: "#64748b",
  pending: "#d1d5db",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RADIAN = Math.PI / 180;

function renderPercentLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const innerRadius = Number(props.innerRadius ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const percent = Number(props.percent ?? 0);

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ---------------------------------------------------------------------------
// 1. StatusPieChart
// ---------------------------------------------------------------------------

interface StatusPieChartProps {
  data: { name: string; value: number; fill: string }[];
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              labelLine={false}
              label={renderPercentLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`status-cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 2. DepartmentBarChart
// ---------------------------------------------------------------------------

interface DepartmentBarChartProps {
  data: { department: string; count: number }[];
}

export function DepartmentBarChart({ data }: DepartmentBarChartProps) {
  const chartHeight = Math.max(400, data.length * 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects by Department</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="department"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 12 }} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 3. DecisionDonutChart
// ---------------------------------------------------------------------------

interface DecisionDonutChartProps {
  data: { name: string; value: number; fill: string }[];
}

export function DecisionDonutChart({ data }: DecisionDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`decision-cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            {/* Center total label */}
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground text-2xl font-bold"
            >
              {total}
            </text>
            <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground text-xs"
            >
              Total
            </text>
            <Tooltip />
            <Legend verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 4. DepartmentStatusChart
// ---------------------------------------------------------------------------

interface DepartmentStatusChartProps {
  data: {
    department: string;
    idea: number;
    development: number;
    pilot: number;
  }[];
}

export function DepartmentStatusChart({ data }: DepartmentStatusChartProps) {
  const chartHeight = Math.max(400, data.length * 40);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="department"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Bar
              dataKey="idea"
              name="Idea"
              stackId="status"
              fill={STATUS_COLORS.idea}
            />
            <Bar
              dataKey="development"
              name="Development"
              stackId="status"
              fill={STATUS_COLORS.development}
            />
            <Bar
              dataKey="pilot"
              name="Pilot"
              stackId="status"
              fill={STATUS_COLORS.pilot}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 5. TimelineChart
// ---------------------------------------------------------------------------

interface TimelineChartProps {
  data: { month: string; created: number }[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Creation Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="created"
              name="Projects Created"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#createdGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// 6. OverviewCards
// ---------------------------------------------------------------------------

interface OverviewCardsProps {
  stats: {
    totalProjects: number;
    totalDepartments: number;
    totalDuplications: number;
    pendingDecisions: number;
    techRadarItems: number;
    lessonsLearned: number;
  };
}

const STAT_CONFIG = [
  {
    key: "totalProjects" as const,
    label: "Total Projects",
    icon: FolderKanban,
    color: "text-blue-500",
  },
  {
    key: "totalDepartments" as const,
    label: "Departments",
    icon: Building2,
    color: "text-emerald-500",
  },
  {
    key: "totalDuplications" as const,
    label: "Duplications",
    icon: AlertTriangle,
    color: "text-amber-500",
  },
  {
    key: "pendingDecisions" as const,
    label: "Pending Decisions",
    icon: Clock,
    color: "text-orange-500",
  },
  {
    key: "techRadarItems" as const,
    label: "Tech Radar Items",
    icon: Radar,
    color: "text-teal-500",
  },
  {
    key: "lessonsLearned" as const,
    label: "Lessons Learned",
    icon: BookOpen,
    color: "text-violet-500",
  },
];

export function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STAT_CONFIG.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tracking-tight">{stats[key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Re-export color maps for use in parent pages
// ---------------------------------------------------------------------------

export { STATUS_COLORS, DECISION_COLORS };
