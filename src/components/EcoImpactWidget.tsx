import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useEcoImpact } from "@/hooks/useEcoImpact";
import { Leaf, TrendingUp, TreePine } from "lucide-react";

export const EcoImpactWidget = () => {
  const { stats } = useEcoImpact();

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          Votre impact écologique
        </CardTitle>
        <CardDescription>
          Merci pour votre engagement pour la planète !
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {stats.walksCompleted}
            </div>
            <p className="text-xs text-muted-foreground">balades</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">
              {stats.co2Saved.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">CO₂ économisé</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-nature-green">
              {stats.treesEquivalent.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">arbres/an</p>
          </div>
        </div>
        {stats.co2Saved > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2 text-sm">
            <TreePine className="h-4 w-4 text-primary" />
            <p className="text-muted-foreground">
              Équivalent à l'absorption de {stats.treesEquivalent.toFixed(1)} arbre(s) pendant un an !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
