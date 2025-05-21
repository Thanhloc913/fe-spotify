import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, Stack, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import { musicApi } from "../../api";
import { createSongV2, updateSong, deleteSongs } from "../../api/musicApi";
import { createStorageData, uploadFile } from "../../api/storageApi";
import {
  AddSongFormProps,
  AddSongModal,
} from "../../components/admin/AddSongModal";
import {
  EditSongFormProps,
  EditSongModal,
} from "../../components/admin/EditSongModal";
import GenericTableActionEdit, {
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import {
  useAdminLoading,
  useAdminLoadingState,
} from "../../store/paginationStore";
import {
  ApiPaginatedResult,
  ApiResponse,
  ApiSongCreateRequest,
  ApiSongType,
  ApiSongUpdateRequest,
  ApiStorageUploadResponse,
} from "../../types/api";

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

  const handleRequestSort = (property: keyof SongTableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  useEffect(() => {
    const getSongsFromApi = async () => {
      await loading(async () => {
        const pagedResult = (
          await musicApi.searchSongsByTitle(search, page + 1, rowsPerPage)
        ).data;
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
    search,
    page,
    rowsPerPage,
    columnSortOrder,
    columnSortOrderBy,
    refreshKey,
    loading,
  ]);

  const handleSelectAllClick = async (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = (
        await loading(
          async () =>
            await musicApi.searchSongsByTitle(search, page + 1, rowsPerPage)
        )()
      ).data.result.map((s) => s.id);
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

  const handleOpenPreview = (data: unknown) => {
    setSubmittedData(data);
    setOpenPreviewModal(true);
  };

  const handleDeleteSongs = async (selectedIds: RowId[]) => {
    try {
      const result = await deleteSongs(selectedIds as string[]);
      handleOpenPreview(result);
      setSelectedItems([]);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      handleOpenPreview(error);
    }
  };

  const editingSong = useMemo(
    () => displayingResult?.result?.find((u) => u.id === editingSongId),
    [displayingResult?.result, editingSongId]
  );

  const loadingState = useAdminLoadingState();
  const handleCloseModal = (onClose: () => void) => {
    if (loadingState.count === 0) onClose();
  };

  const handleCreate = async (data: AddSongFormProps) => {
    await loading(async () => {
      const logs: Record<string, unknown> = {};
      let finalCreateSongResult: ApiResponse<ApiSongType> | null = null;
      try {
        if (data.albumIds.length <= 0) {
          throw new Error("Must have at least one album connected to a song");
        }
        const actorId = localStorage.getItem("profile_id");
        if (!actorId) {
          throw new Error("Artist or User ID not found!");
        }
        logs["actorId"] = actorId;

        if (!data.song) {
          throw new Error("Please select a song file!");
        }

        // 1. Upload the song file
        const songUploadResult = await uploadFile(data.song);
        logs["songUploadResult"] = {
          success: songUploadResult.success,
          message: songUploadResult.message,
          error: songUploadResult.error,
          status: songUploadResult.status,
          fileName: songUploadResult.data?.fileName,
        };

        if (!songUploadResult.success || !songUploadResult.data) {
          throw new Error(
            songUploadResult?.message || "Failed to upload song file."
          );
        }
        const songFileInfo = songUploadResult.data;

        // 2. Create storage entry for the song
        const songStorageResult = await createStorageData({
          fileName: songFileInfo.fileName,
          fileType: songFileInfo.fileType,
          userId: actorId,
          fileUrl: songFileInfo.fileUrl,
          fileSize: songFileInfo.fileSize,
          description: `File am nhac ${songFileInfo.fileName}`,
        });
        logs["songStorageResult"] = {
          success: songStorageResult.success,
          message: songStorageResult.message,
          error: songStorageResult.error,
          status: songStorageResult.status,
          storageId: songStorageResult.data?.id,
        };

        if (!songStorageResult.success || !songStorageResult.data) {
          throw new Error(
            songStorageResult.error?.message ||
              "Failed to create storage entry for the song."
          );
        }
        const songStorageId = songStorageResult.data.id;
        let storageImageId: string | null = null;
        logs["songStorageId"] = songStorageId; // 3. Upload the background image (if provided)

        if (data.background) {
          const backgroundUploadResult: ApiResponse<ApiStorageUploadResponse> =
            await uploadFile(data.background);
          logs["backgroundUploadResult"] = backgroundUploadResult;

          if (!backgroundUploadResult.success) {
            throw new Error(
              backgroundUploadResult?.message ||
                "Failed to upload background image."
            );
          } else if (backgroundUploadResult.data) {
            const backgroundImageInfo = backgroundUploadResult.data;
            const backgroundStorageResult = await createStorageData({
              fileName: backgroundImageInfo.fileName,
              fileType: backgroundImageInfo.fileType,
              userId: actorId,
              fileUrl: backgroundImageInfo.fileUrl,
              fileSize: backgroundImageInfo.fileSize,
              description: `File hinh anh ${backgroundImageInfo.fileName} cho ${songFileInfo.fileName}`,
            });
            logs["backgroundStorageResult"] = backgroundStorageResult;

            if (
              !backgroundStorageResult.success ||
              !backgroundStorageResult.data
            ) {
              throw new Error(
                backgroundStorageResult.message ||
                  "Failed to create storage entry for the background image."
              );
            } else {
              storageImageId = backgroundStorageResult.data.id;
              logs["storageImageId"] = storageImageId;
            }
          }
        } else {
          logs["backgroundSkipped"] = "No background image provided.";
        }

        // 4. Determine song type
        const songType: "SONG" | "MUSIC_VIDEO" = songFileInfo.fileType.includes(
          "audio"
        )
          ? "SONG"
          : "MUSIC_VIDEO";
        logs["songType"] = songType;

        // 5. Create the song
        const createSongRequest: ApiSongCreateRequest = {
          title: data.title,
          artistId: actorId,
          genreId: data.albumIds, // Assuming albumIds is used for genreId for now, adjust as needed
          storageId: songStorageId,
          storageImageId: storageImageId,
          duration: data.duration,
          description: data.description,
          albumId: data.albumIds,
          songType,
        };
        logs["createSongRequest"] = createSongRequest;

        finalCreateSongResult = await createSongV2(createSongRequest);
        logs["createSongResult"] = finalCreateSongResult;

        if (!finalCreateSongResult.success) {
          throw new Error(
            finalCreateSongResult?.message ||
              `Failed to create song: ${finalCreateSongResult.message}`
          );
        }
        setSubmittedData({ songData: finalCreateSongResult.data, logs });
        setOpenPreviewModal(true);
        setOpenAddModal(false);
        setRefreshKey((k) => k + 1);
      } catch (error) {
        console.error("Error creating song:", error);
        setSubmittedData({ error: (error as Error).message, logs });
        setOpenPreviewModal(true);
      }
    })();
  };

  const handleEdit = async (data: EditSongFormProps, song: ApiSongType) => {
    await loading(async () => {
      const logs: Record<string, unknown> = {};
      let finalUpdateData: ApiSongType | null = null;

      try {
        const actorId = localStorage.getItem("profile_id");
        if (!actorId) {
          throw new Error("Artist or User ID not found!");
        }
        logs["actorId"] = actorId;

        // Prepare update payload
        const updatePayload: ApiSongUpdateRequest = {
          id: song.id, // Required - existing song ID
          title: data.title || song.title,
          duration: data.duration || song.duration,
          storageImageId: null,
          description: data.description || song.description,
          songType: song.songType, // Keep original type unless you want to change it
        };

        // Handle background image update if provided
        if (data.background) {
          const uploadResult = await uploadFile(data.background);
          logs["backgroundUpload"] = uploadResult;

          if (!uploadResult.success || !uploadResult.data) {
            throw new Error(uploadResult.message || "Background upload failed");
          }

          const storageResult = await createStorageData({
            fileName: uploadResult.data.fileName,
            fileType: uploadResult.data.fileType,
            userId: actorId,
            fileUrl: uploadResult.data.fileUrl,
            fileSize: uploadResult.data.fileSize,
            description: `Background image for ${data.title}`,
          });

          if (!storageResult.success || !storageResult.data) {
            throw new Error("Failed to create storage entry for background");
          }

          updatePayload.storageImageId = storageResult.data.id;
          logs["newBackgroundStorageId"] = updatePayload.storageImageId;
        } else if (data.removeBackground) {
          // Explicitly remove background image
          updatePayload.storageImageId = "";
          logs["backgroundRemoved"] = true;
        }

        // Execute the update
        finalUpdateData = await updateSong(updatePayload);
        logs["updateResult"] = finalUpdateData;

        if (!finalUpdateData) {
          throw new Error("Song update failed");
        }

        // Success handling
        setSubmittedData({ songData: finalUpdateData, logs });
        setOpenPreviewModal(true);
        setOpenEditModal(false);
        setRefreshKey((k) => k + 1);
      } catch (error) {
        console.error("Error updating song:", error);
        setSubmittedData({
          error: (error as Error).message,
          logs,
          originalSong: song,
          attemptedChanges: data,
        });
        setOpenPreviewModal(true);
      }
    })();
  };

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
            onBlur={(e) => setSearch(e.target.value)}
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
            onClose={() => handleCloseModal(() => setOpenEditModal(false))}
            onSubmit={handleEdit}
            song={editingSong}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddSongModal
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

export default ManageSongs;
