import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, Stack, TextField } from "@mui/material";
import { FC, useEffect, useMemo, useState } from "react";
import {
  AddAlbum2FormProps,
  AddAlbum2Modal,
} from "../../components/admin/AddAlbum2Modal";
import {
  EditAlbum2FormProps,
  EditAlbum2Modal,
} from "../../components/admin/EditAlbum2Modal";
import GenericTableActionEdit, {
  RowId,
  SortOrder,
} from "../../components/admin/GenericTable";
import { PreviewModal } from "../../components/admin/PreviewModal";
import {
  ApiPaginatedResult,
  ApiAlbumType,
  ApiResponse,
  ApiStorageUploadResponse,
  ApiCreateAlbumRequest,
  ApiEditAlbumRequest,
} from "../../types/api";
import {
  createAlbum,
  deleteAlbums,
  editAlbum,
  getAlbums,
} from "../../api/musicApi";
import { useAdminLoading } from "../../store/paginationStore";
import { createStorageData, uploadFile } from "../../api/storageApi";

type Album2 = ApiAlbumType;
type Paginated<T> = ApiPaginatedResult<T>;

type Album2TableColumnNames = Pick<
  ApiAlbumType,
  "id" | "backgroundUrl" | "name" | "artistId" | "createdAt" | "updatedAt"
>;

type Album2TableColumnDefinition = {
  id: keyof Album2TableColumnNames;
  label: string;
  sortable: boolean;
  render?: (value: ApiAlbumType) => React.ReactNode;
};

// Define which columns to show and how to render them
const album2TableColumnDefinitions: Album2TableColumnDefinition[] = [
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
  { id: "name", label: "name", sortable: true },
  { id: "artistId", label: "Artist ID", sortable: true },
  {
    id: "createdAt",
    label: "Created",
    sortable: true,
    render: (value: ApiAlbumType) => new Date(value.createdAt).toLocaleString(),
  },
  {
    id: "updatedAt",
    label: "Updated",
    sortable: true,
    render: (value: ApiAlbumType) => new Date(value.updatedAt).toLocaleString(),
  },
] as const;

interface Album2TableActionEditProps {
  data: Album2[]; // Only the current page rows
  selectedIds: RowId[];
  onSelect: (id: RowId, isSelected: boolean) => void;
  onSelectAll: (isSelected: boolean) => void;
  onEdit: (id: RowId) => void;
  onDelete: (selectedIds: RowId[]) => void;
  onRequestSort: (
    column: keyof Album2TableColumnNames,
    order: SortOrder
  ) => void;
  onRequestPageChange: (newPage: number) => void;
  onRequestRowsPerPageChange: (rowsPerPage: number) => void;
  order: SortOrder;
  orderBy: keyof Album2TableColumnNames;
  page: number;
  rowsPerPage: number;
  totalCount: number;
}

const Album2TableActionEdit: FC<Album2TableActionEditProps> = ({
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
    <GenericTableActionEdit<Album2, "id">
      label="Album2s"
      pluralEntityName="Album2s"
      data={data}
      columnDefinitions={album2TableColumnDefinitions}
      idKey="id"
      selectedIds={selectedIds}
      onSelect={onSelect}
      onSelectAll={onSelectAll}
      onEdit={onEdit}
      onDelete={onDelete}
      onRequestSort={(column, order) => {
        const def = album2TableColumnDefinitions.find(
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

const ManageAlbum2s = () => {
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingAlbum2Id, setEditingAlbum2Id] = useState<RowId | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<RowId[]>([]);
  const [columnSortOrder, setColumnSortOrder] = useState<"asc" | "desc">(
    "desc"
  );
  const [columnSortOrderBy, setColumnSortOrderBy] =
    useState<keyof Album2TableColumnNames>("updatedAt");

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<unknown>(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  const [displayingResult, setDisplayingResult] = useState<Paginated<Album2>>({
    result: [],
    currentPage: 1,
    total: 0,
    totalPages: 1,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const loading = useAdminLoading();

  useEffect(() => {
    const getAlbumsFromApi = async () => {
      await loading(async () => {
        const pagedResult = await getAlbums({
          name: search,
          page: page + 1,
          pageSize: rowsPerPage,
        });
        // api chưa có sort nên sort tạm local
        if (pagedResult.result && pagedResult.result.length > 0) {
          pagedResult.result.sort((a, b) => {
            const aValue = a[columnSortOrderBy];
            const bValue = b[columnSortOrderBy];

            // Handle null/undefined: null is always smaller
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return -1;
            if (bValue == null) return 1;

            if (aValue < bValue) return columnSortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return columnSortOrder === "asc" ? 1 : -1;
            return 0;
          });
        }
        setDisplayingResult(pagedResult);
        console.log("paged result", pagedResult);
      })();
    };
    getAlbumsFromApi();
  }, [
    search,
    page,
    rowsPerPage,
    columnSortOrder,
    columnSortOrderBy,
    refreshKey,
    loading,
  ]);

  const handleRequestSort = (property: keyof Album2TableColumnNames) => {
    const isAsc = columnSortOrderBy === property && columnSortOrder === "asc";
    setColumnSortOrder(isAsc ? "desc" : "asc");
    setColumnSortOrderBy(property);
  };

  const handleSelectAllClick = async (isSelected: boolean) => {
    if (isSelected) {
      const newSelecteds = (
        await getAlbums({ name: search, page: 1, pageSize: 100 })
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

  const handleEditAlbum2 = (selectedId: RowId) => {
    setEditingAlbum2Id(selectedId);
    setOpenEditModal(true);
  };

  const editingAlbum2 = useMemo(
    () => displayingResult.result.find((u) => u.id === editingAlbum2Id),
    [displayingResult.result, editingAlbum2Id]
  );

  const handleOpenPreview = (data: unknown) => {
    setSubmittedData(data);
    setOpenPreviewModal(true);
  };

  const handleDeleteAlbum2s = async (selectedIds: RowId[]) => {
    try {
      const result = await deleteAlbums(selectedIds as string[]);
      handleOpenPreview(result);
      setSelectedItems([]);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      handleOpenPreview(error);
    }
  };

  const handleCreate = async (data: AddAlbum2FormProps) => {
    await loading(async () => {
      const logs: Record<string, unknown> = {};
      let finalCreateAlbumResult: ApiAlbumType | null = null;
      try {
        const actorId = localStorage.getItem("profile_id");
        if (!actorId) {
          throw new Error("Artist or User ID not found!");
        }
        logs["actorId"] = actorId;

        let storageImageId: string | null = null;

        // 1. Upload the cover image (if provided)
        if (data.coverImage) {
          const coverUploadResult: ApiResponse<ApiStorageUploadResponse> =
            await uploadFile(data.coverImage);
          logs["coverUploadResult"] = coverUploadResult;

          if (!coverUploadResult.success || !coverUploadResult.data) {
            throw new Error(
              coverUploadResult?.message || "Failed to upload cover image."
            );
          }

          const coverImageInfo = coverUploadResult.data;

          // 2. Create storage entry for the cover image
          const coverStorageResult = await createStorageData({
            fileName: coverImageInfo.fileName,
            fileType: coverImageInfo.fileType,
            userId: actorId,
            fileUrl: coverImageInfo.fileUrl,
            fileSize: coverImageInfo.fileSize,
            description: `Cover image for album ${data.name}`,
          });
          logs["coverStorageResult"] = coverStorageResult;

          if (!coverStorageResult.success || !coverStorageResult.data) {
            throw new Error(
              coverStorageResult.error?.message ||
                "Failed to create storage entry for the cover image."
            );
          }
          storageImageId = coverStorageResult.data.id;
          logs["storageImageId"] = storageImageId;
        } else {
          logs["coverImageSkipped"] = "No cover image provided.";
        }

        // 3. Create the album
        const createAlbumRequest: ApiCreateAlbumRequest = {
          name: data.name,
          description: data.description,
          artistId: data.artistId,
          storageImageId: storageImageId, // This will be null if no image was uploaded
        };
        logs["createAlbumRequest"] = createAlbumRequest;

        finalCreateAlbumResult = await createAlbum(createAlbumRequest);
        logs["createAlbumResult"] = finalCreateAlbumResult;

        if (!finalCreateAlbumResult) {
          throw new Error("Failed to create album.");
        }

        // Assuming your API returns success/message directly or throws error for failure
        // You might need to check finalCreateAlbumResult.success if it's an ApiResponse
        setSubmittedData({ albumData: finalCreateAlbumResult, logs }); // Adjust `setSubmittedData` as per your context
        setOpenPreviewModal(true); // Assuming you have these states
        setOpenAddModal(false);
        setRefreshKey((k) => k + 1);
      } catch (error) {
        console.error("Error creating album:", error);
        setSubmittedData({ error: (error as Error).message, logs });
        setOpenPreviewModal(true);
      }
    })();
  };

  const handleEdit = async (
    data: EditAlbum2FormProps,
    album2: ApiAlbumType // Pass the original album object for current backgroundUrl
  ) => {
    await loading(async () => {
      const logs: Record<string, unknown> = {};
      let finalUpdateData: ApiAlbumType | null = null;

      try {
        const actorId = localStorage.getItem("profile_id");
        if (!actorId) {
          throw new Error("Artist or User ID not found!");
        }
        logs["actorId"] = actorId;

        // Prepare update payload
        const updatePayload: ApiEditAlbumRequest = {
          id: album2.id, // Required - existing album ID
          name: data.name,
          description: data.description,
          artistId: data.artistId,
          storageImageId: "",
          removeImage: data.removeCoverImage,
        };

        // Handle cover image update logic
        if (data.coverImage) {
          // A new file is selected, upload it
          const uploadResult = await uploadFile(data.coverImage);
          logs["coverUpload"] = uploadResult;

          if (!uploadResult.success || !uploadResult.data) {
            throw new Error(
              uploadResult.message || "Cover image upload failed"
            );
          }

          const storageResult = await createStorageData({
            fileName: uploadResult.data.fileName,
            fileType: uploadResult.data.fileType,
            userId: actorId,
            fileUrl: uploadResult.data.fileUrl,
            fileSize: uploadResult.data.fileSize,
            description: `Cover image for album ${data.name}`,
          });
          logs["newCoverStorageResult"] = storageResult;

          if (!storageResult.success || !storageResult.data) {
            throw new Error(
              "Failed to create storage entry for new cover image"
            );
          }

          updatePayload.storageImageId = storageResult.data.id;
          logs["newCoverStorageId"] = updatePayload.storageImageId;
        } else if (data.removeCoverImage && album2.backgroundUrl) {
          // User explicitly wants to remove the current cover image
          // Only if there was a current image to remove
          updatePayload.storageImageId = ""; // indicate removal
          logs["coverImageRemoved"] = true;
        } else if (
          !data.coverImage &&
          !data.removeCoverImage &&
          album2.storageImageId
        ) {
          // No new file, no removal requested, keep existing if it was there
          updatePayload.storageImageId = album2.storageImageId;
          logs["coverImageKept"] = true;
        } else if (
          !data.coverImage &&
          !data.removeCoverImage &&
          !album2.storageImageId
        ) {
          // No new file, no removal requested, and no existing image
          updatePayload.storageImageId = "";
          logs["coverImageNull"] = true;
        }

        // Execute the update
        finalUpdateData = await editAlbum(updatePayload);
        logs["updateAlbumResult"] = finalUpdateData;

        if (!finalUpdateData) {
          throw new Error("Album update failed");
        }

        // Success handling
        setSubmittedData({ albumData: finalUpdateData, logs }); // Adjust `setSubmittedData` as per your context
        setOpenPreviewModal(true); // Assuming you have these states
        setOpenEditModal(false);
        setRefreshKey((k) => k + 1);
      } catch (error) {
        console.error("Error updating album:", error);
        setSubmittedData({
          error: (error as Error).message,
          logs,
          originalAlbum: album2, // Include original data for debugging
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
        <Album2TableActionEdit
          data={displayingResult.result}
          selectedIds={selectedItems}
          onSelect={handleClick}
          onSelectAll={handleSelectAllClick}
          onEdit={handleEditAlbum2}
          onDelete={handleDeleteAlbum2s}
          onRequestSort={handleRequestSort}
          onRequestPageChange={handleChangePage}
          onRequestRowsPerPageChange={handleChangeRowsPerPage}
          order={columnSortOrder}
          orderBy={columnSortOrderBy}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={displayingResult.total}
        />
        {editingAlbum2 && (
          <EditAlbum2Modal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            onSubmit={handleEdit}
            album2={editingAlbum2}
          />
        )}
      </Stack>
      {openAddModal && (
        <AddAlbum2Modal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
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

export default ManageAlbum2s;
