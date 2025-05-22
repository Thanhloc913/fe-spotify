import AddIcon from "@mui/icons-material/Add";
import { Avatar, Button, Stack } from "@mui/material";
import { FC, useEffect, useState } from "react";
import {
  createAlbumSongs,
  deleteAlbumSongMany,
  getSongsByAlbumId,
} from "../../api/musicApi";
import AddAlbumSongModal, {
  AddAlbumSongFormProps,
} from "../../components/admin/AddAlbumSongModal";
import {
  GenericTable,
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import {
  useAdminLoading,
  useAdminLoadingState,
} from "../../store/paginationStore";
import { ApiAlbumType, ApiPaginatedResult, ApiSongType } from "../../types/api";

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
    render: (song) =>
      song.backgroundUrl ? (
        <Avatar
          src={song.backgroundUrl}
          variant="rounded"
          sx={{ width: 50, height: 50 }}
        />
      ) : null,
  },
  { id: "title", label: "Title", sortable: true },
  { id: "description", label: "Description", sortable: false },
  { id: "artistId", label: "Artist ID", sortable: true },
  { id: "duration", label: "Duration", sortable: true },
  { id: "songType", label: "Song Type", sortable: true },
] as const;

interface AlbumSongsTableProps {
  data: Song[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
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

const AlbumSongsTable: FC<AlbumSongsTableProps> = ({
  data,
  selectedIds,
  onSelect,
  onSelectAll,
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
    <GenericTable<Song, "id">
      label="Songs"
      pluralEntityName="Songs"
      data={data}
      columnDefinitions={songTableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      rowActions={[]}
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

const ManageAlbumSongs = ({ album }: { album: ApiAlbumType }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof SongTableColumnNames>("id");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<unknown>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [displayingResult, setDisplayingResult] = useState<Paginated<Song>>({
    result: [],
    currentPage: 1,
    total: 0,
    totalPages: 1,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const loading = useAdminLoading();
  const { id: albumId } = album;

  const handleRequestSort = (property: keyof SongTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  useEffect(() => {
    const getSongsFromApi = async () => {
      await loading(async () => {
        const pagedResult = await getSongsByAlbumId({
          albumId: albumId,
          page: page + 1,
          pageSize: rowsPerPage,
        });
        // api chưa có sort nên sort tạm local
        if (pagedResult.result && pagedResult.result.length > 0) {
          pagedResult.result.sort((a, b) => {
            const aValue = a[columnSortOrderBy];
            const bValue = b[columnSortOrderBy];
            if (aValue < bValue) return columnSortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return columnSortOrder === "asc" ? 1 : -1;
            return 0;
          });
        }
        setDisplayingResult(pagedResult);
        console.log("paged result", pagedResult);
      })();
    };
    getSongsFromApi();
  }, [
    page,
    rowsPerPage,
    columnSortOrder,
    columnSortOrderBy,
    refreshKey,
    loading,
    albumId,
  ]);

  const handleSelectAllClick = async (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = (
        await loading(
          async () =>
            await getSongsByAlbumId({
              albumId: album.id,
              page: page + 1,
              pageSize: rowsPerPage,
            })
        )()
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

  const handleOpenPreview = (data: unknown) => {
    setSubmittedData(data);
    setOpenPreviewModal(true);
  };

  const handleDelete = async (selectedIds: RowId[]) => {
    try {
      const result = await deleteAlbumSongMany(
        selectedIds.map((id) => {
          return { albumID: albumId, songID: id as string };
        })
      );
      handleOpenPreview(result);
      setSelectedItems([]);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      handleOpenPreview(error);
    }
  };

  const loadingState = useAdminLoadingState();
  const handleCloseModal = (onClose: () => void) => {
    if (loadingState.count === 0) onClose();
  };

  const handleCreate = async (data: AddAlbumSongFormProps) => {
    await loading(async () => {
      try {
        const result = await createAlbumSongs({
          albumID: albumId,
          songIDs: data.songIds,
        });
        handleOpenPreview(result);
        setRefreshKey((k) => k + 1);
        setOpenAddModal(false);
      } catch (error) {
        handleOpenPreview(error);
      }
    })();
  };

  return (
    <>
      <Stack className="flex-auto overflow-y-auto">
        <Stack
          direction="row-reverse"
          spacing={2}
          alignItems="center"
          sx={{ marginBottom: "1rem" }}
        >
          <Button variant="contained" onClick={() => setOpenAddModal(true)}>
            <AddIcon />
          </Button>
        </Stack>
        <AlbumSongsTable
          data={displayingResult.result}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onDelete={handleDelete}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={displayingResult.total}
        />
      </Stack>
      {openAddModal && (
        <AddAlbumSongModal
          open={openAddModal}
          onClose={() => handleCloseModal(() => setOpenAddModal(false))}
          onSubmit={handleCreate}
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

export default ManageAlbumSongs;
