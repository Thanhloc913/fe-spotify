import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Stack, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import { AddSongModal } from "../../components/admin/AddSongModal";
import { EditSongModal } from "../../components/admin/EditSongModal";
import GenericTableActionEdit, {
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import { ApiPaginatedResult, ApiSongType } from "../../types/api";
import { musicApi } from "../../api";

type Song = ApiSongType;
type Paginated<T> = ApiPaginatedResult<T>;
type SongTableColumnNames = Pick<
  Song,
  | "id"
  | "backgroundUrl"
  | "title"
  | "description"
  | "artistId"
  | "duration"
  | "songType"
>;

type SongTableColumnDefinition = {
  id: keyof SongTableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: Song) => React.ReactNode;
};

// Define which columns to show and how to render them
const songTableColumnDefinitions: SongTableColumnDefinition[] = [
  { id: "id", label: "ID", sortable: true },
  {
    id: "backgroundUrl",
    label: "Background",
    sortable: false,
    render: (song) => (
      <img
        src={song.backgroundUrl}
        alt="background"
        style={{ width: 50, height: 50, objectFit: "cover" }}
      />
    ),
  },
  { id: "title", label: "Title", sortable: true },
  { id: "description", label: "Description", sortable: false },
  { id: "artistId", label: "Artist ID", sortable: true },
  { id: "duration", label: "Duration", sortable: true },
  { id: "songType", label: "Song Type", sortable: true },
] as const;

interface SongTableActionEditProps {
  data: Song[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (column: keyof SongTableColumnNames, order: SortOrder) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof SongTableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const SongTableActionEdit: FC<SongTableActionEditProps> = ({
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
    <GenericTableActionEdit<Song, "id">
      label="Songs"
      pluralEntityName="Songs"
      data={data}
      columnDefinitions={songTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = songTableColumnDefinitions.find((def) => def.id === column);
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

const ManageSongs = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingSongId, setEditingSongId] = useState<RowId | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof SongTableColumnNames>("id");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<object | null>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [displayingResult, setDisplayingResult] = useState<Paginated<Song>>({
    result: [],
    currentPage: 1,
    total: 0,
    totalPages: 1,
  });

  const handleRequestSort = (property: keyof SongTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  useEffect(() => {
    const getSongsFromApi = async () =>
      setDisplayingResult(
        await musicApi.searchSongsByTitle(search, page, rowsPerPage)
      );
    getSongsFromApi();
  }, [search, page, rowsPerPage]);

  const handleSelectAllClick = async (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = (
        await musicApi.searchSongsByTitle(search, page, rowsPerPage)
      ).result.map((s) => s.id);
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

  const handleEditSong = (selectedId: RowId) => {
    setEditingSongId(selectedId);
    setOpenEditModal(true);
  };

  const handleDeleteSongs = (selectedIds: RowId[]) => {
    console.log("Deleting songs with IDs:", selectedIds);
    setSelectedItems([]); // Clear selection after deletion for now
  };

  const editingSong = useMemo(
    () => displayingResult.result.find((u) => u.id === editingSongId),
    [displayingResult]
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
        <SongTableActionEdit
          data={displayingResult.result}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditSong}
          onDelete={handleDeleteSongs}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={displayingResult.total}
        />
        {editingSong && (
          <EditSongModal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={(data, song) => {
              setSubmittedData({ ...song, ...data });
              setOpenPreviewModal(true);
            }}
            song={editingSong}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddSongModal
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

export default ManageSongs;
