import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users as UsersIcon, Search } from "lucide-react";
import { toast } from "sonner";

type User = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

const UsersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Utilisateurs ({users.length})</h3>
        <div className="flex items-center gap-2 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom d'utilisateur</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Bio</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead className="text-right">ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {searchTerm
                    ? "Aucun utilisateur trouvé"
                    : "Aucun utilisateur inscrit"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.username || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {user.full_name || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">
                    {user.bio || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground font-mono">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} affiché{filteredUsers.length > 1 ? "s" : ""}
        </p>
        <Button variant="outline" size="sm" onClick={fetchUsers}>
          <Loader2 className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>
    </div>
  );
};

export default UsersManager;
