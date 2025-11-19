import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge as BadgeUI } from "./ui/badge";
import { useBadges } from "@/hooks/useBadges";
import { Award } from "lucide-react";

export const BadgesDisplay = () => {
  const { badges } = useBadges();
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Vos badges ({unlockedBadges.length}/{badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-lg border text-center transition-all ${
                badge.unlocked
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/50 border-border opacity-50"
              }`}
            >
              <div className="text-3xl mb-1">{badge.icon}</div>
              <div className="text-sm font-semibold">{badge.name}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {badge.description}
              </p>
              {badge.unlocked && badge.unlockedAt && (
                <BadgeUI variant="secondary" className="mt-2 text-xs">
                  Débloqué !
                </BadgeUI>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
