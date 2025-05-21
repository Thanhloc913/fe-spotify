import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, Stack, TextField } from "@mui/material";
import { FC, useMemo, useState } from "react";
import { AddTrackModal } from "../../components/admin/AddTrackModal";
import { EditTrackModal } from "../../components/admin/EditTrackModal";
import {
  GenericTableActionEdit,
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { mockData } from "../../mock/data";
import { Track } from "../../types";

type TrackTableColumnNames = Pick<
  Track,
  "id" | "title" | "albumName" | "artistName" | "coverUrl"
>;

type TrackTableColumnDefinition = {
  id: keyof TrackTableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Track) => React.ReactNode;
};

// Define which columns to show and how to render them
const trackTableColumnDefinitions: TrackTableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  { id: "title", label: "Name", sortable: true },
  { id: "albumName", label: "Album", sortable: true },
  { id: "artistName", label: "Artist(s)", sortable: true },

  {
    id: "coverUrl",
    label: "Avater",
    sortable: false,
    render: (value: Track) =>
      value.coverUrl ? <Avatar src={value.coverUrl} /> : null,
  },
] as const;

interface TrackTableActionEditProps {
  data: Track[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof TrackTableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof TrackTableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const TrackTableActionEdit: FC<TrackTableActionEditProps> = ({
  data,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onRequestSort,
  onRequestPageChange,
  onRequestRowsPerPageChange,
  order,
  orderBy,
  page,
  rowsPerPage,
  totalCount,
}) => {
  return (
    <GenericTableActionEdit<Track, "id">
      label="Tracks"
      pluralEntityName="Tracks"
      data={data}
      columnDefinitions={trackTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = trackTableColumnDefinitions.find(
          (def) => def.id === column
        );
        if (def) {
          onRequestSort(def.id, order);
        }
      }}
      onRequestPageChange={onRequestPageChange}
      onRequestRowsPerPageChange={onRequestRowsPerPageChange}
      order={order}
      orderBy={orderBy}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
    />
  );
};

const ManageTracks = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<RowId | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof TrackTableColumnNames>("title");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<object | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const filteredTracks = useMemo(() => {
    return mockData.tracks.filter((track) =>
      Object.keys(track).some((key) =>
        String(track[key as keyof Track])
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search]);

  const handleRequestSort = (property: keyof TrackTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const sortedTracks = useMemo(() => {
    const stabilizedThis = filteredTracks.map(
      (el, index) => [el, index] as const
    );
    stabilizedThis.sort((a, b) => {
      const orderFn = (objA: Track, objB: Track, property: keyof Track) => {
        const valA = objA[property];
        const valB = objB[property];

        // Handle null/undefined
        if (valA == null && valB == null) return 0;
        if (valA == null) return -1;
        if (valB == null) return 1;

        // Handle arrays
        if (Array.isArray(valA) && Array.isArray(valB)) {
          const minLen = Math.min(valA.length, valB.length);
          for (let i = 0; i < minLen; i++) {
            if (valA[i] == null && valB[i] == null) continue;
            if (valA[i] == null) return -1;
            if (valB[i] == null) return 1;
            if (valA[i] < valB[i]) return -1;
            if (valA[i] > valB[i]) return 1;
          }
          // If all elements so far are equal, shorter array is smaller
          if (valA.length < valB.length) return -1;
          if (valA.length > valB.length) return 1;
          return 0;
        }

        // If only one is array, treat array as greater
        if (Array.isArray(valA)) return 1;
        if (Array.isArray(valB)) return -1;

        // Normal comparison
        if (valA < valB) return -1;
        if (valA > valB) return 1;
        return 0;
      };
      const value = orderFn(a[0], b[0], columnSortOrderBy);
      if (value !== 0) {
        return columnSortOrder === "asc" ? value : -value;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }, [filteredTracks, columnSortOrder, columnSortOrderBy]);

  const displayingTracks = useMemo(() => {
    return sortedTracks.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [page, rowsPerPage, sortedTracks]);

  const handleSelectAllClick = (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = sortedTracks
        // uncomment to select all current page only
        // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((n) => n.id);
      setSelectedItems(newSelecteds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleClick = (id: RowId, checked: boolean) => {
    setSelectedItems((prevSelected) => {
      if (checked) {
        return [...prevSelected, id];
      } else {
        return prevSelected.filter((item) => item !== id);
      }
    });
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleEditTrack = (selectedId: RowId) => {
    setEditingTrackId(selectedId);
    setOpenEditModal(true);
  };

  const handleDeleteTracks = (selectedIds: RowId[]) => {
    console.log("Deleting tracks with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion for now
  };

  const editingTrack = useMemo(
    () => mockData.tracks.find((u) => u.id === editingTrackId),
    [editingTrackId]
  );

  return (
    <>
      <Stack className="h-full">
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ marginBottom: "1rem" }}
        >
          <SearchIcon />
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="contained" onClick={() => setOpenAddModal(true)}>
            <AddIcon />
          </Button>
        </Stack>
        <TrackTableActionEdit
          data={displayingTracks}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditTrack}
          onDelete={handleDeleteTracks}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={sortedTracks.length}
        />
        {editingTrack && (
          <EditTrackModal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={(data, track) => {
              setSubmittedData({ ...track, ...data });
              setOpenPreviewModal(true);
            }}
            track={editingTrack}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddTrackModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSubmit={(data) => {
            setSubmittedData(data);
            setOpenPreviewModal(true);
          }}
        />
      )}
      <PreviewModal
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        data={submittedData}
      />
    </>
  );
};

export default ManageTracks;
