"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { DollarSign, Users, Briefcase, Trophy, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";
import { motion } from "framer-motion";

interface DashboardStatsProps {
  totalOpportunities: number;
  totalPipelineValue: number;
  wonOpportunitiesCount: number;
  wonOpportunitiesValue: number;
  activeClientsCount: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DashboardStats({
  totalOpportunities,
  totalPipelineValue,
  wonOpportunitiesCount,
  wonOpportunitiesValue,
  activeClientsCount,
}: DashboardStatsProps) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={item}>
        <Card className="border-l-2 border-l-blue-500 bg-gradient-to-br from-card to-card/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total em Pipeline</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-1.5 text-blue-500">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-foreground">{formatCurrency(totalPipelineValue)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-medium text-blue-500">{totalOpportunities}</span> oportunidades ativas
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-l-2 border-l-green-500 bg-gradient-to-br from-card to-card/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Oportunidades Ganhas</CardTitle>
            <div className="rounded-full bg-green-500/10 p-1.5 text-green-500">
              <Trophy className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-foreground">{formatCurrency(wonOpportunitiesValue)}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-medium text-green-500">{wonOpportunitiesCount}</span> fechamentos de sucesso
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-l-2 border-l-amber-500 bg-gradient-to-br from-card to-card/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <div className="rounded-full bg-amber-500/10 p-1.5 text-amber-500">
              <Users className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-foreground">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Empresas cadastradas
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-l-2 border-l-orange-500 bg-gradient-to-br from-card to-card/50 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            <div className="rounded-full bg-orange-500/10 p-1.5 text-orange-500">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold text-foreground">
              {totalOpportunities > 0
                ? `${Math.round((wonOpportunitiesCount / (totalOpportunities + wonOpportunitiesCount)) * 100)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Baseado no histórico recente
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
