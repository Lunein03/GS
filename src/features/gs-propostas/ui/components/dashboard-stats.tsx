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
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={item}>
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-card/50 shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total em Pipeline</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalPipelineValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-blue-500">{totalOpportunities}</span> oportunidades ativas
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-card to-card/50 shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Oportunidades Ganhas</CardTitle>
            <div className="rounded-full bg-green-500/10 p-2 text-green-500">
              <Trophy className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(wonOpportunitiesValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-green-500">{wonOpportunitiesCount}</span> fechamentos de sucesso
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-card to-card/50 shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes Ativos</CardTitle>
            <div className="rounded-full bg-purple-500/10 p-2 text-purple-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Empresas cadastradas
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-card to-card/50 shadow-md transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            <div className="rounded-full bg-orange-500/10 p-2 text-orange-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalOpportunities > 0
                ? `${Math.round((wonOpportunitiesCount / (totalOpportunities + wonOpportunitiesCount)) * 100)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Baseado no histórico recente
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
