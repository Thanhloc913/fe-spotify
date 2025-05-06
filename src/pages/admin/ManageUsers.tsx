import { useState } from "react";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { mockData } from "../../mock/data";
import { usePaginationStore } from "../../store/paginationStore";
import EditUserModal from "../../components/admin/modal/EditUserModal";
import { User } from "../../types";

const ManageUsers = () => {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { page, setPage } = usePaginationStore();
  const filteredUsers = mockData.users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.slice((page - 1) * 10, page * 10).map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Button
                  onClick={() => {
                    setSelectedUser(user);
                    setOpenModal(true);
                  }}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => setPage(page - 1)} disabled={page === 1}>
        Previous
      </Button>
      <Button onClick={() => setPage(page + 1)}>Next</Button>

      {selectedUser && (
        <EditUserModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          user={selectedUser}
          profile={
            mockData.profiles.find((p) => p.accountID === selectedUser.id) ||
            null
          }
        />
      )}
    </div>
  );
};

export default ManageUsers;
