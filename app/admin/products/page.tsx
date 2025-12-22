"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react"
import { useMutation, useQuery } from "convex/react"
import { Pencil, Trash2, Package, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

type AdminProduct = Doc<"products">

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export default function AdminProductsPage() {
  const categories = useQuery(api.categories.listAll)
  const products = useQuery(api.products.listAllAdmin, {
    limit: 200,
  })
  const createProduct = useMutation(api.products.create)
  const updateProduct = useMutation(api.products.update)
  const removeProduct = useMutation(api.products.remove)
  const generateUploadUrl = useMutation(api.products.generateUploadUrl)
  const getUrlForStorageId = useMutation(api.products.getUrlForStorageId)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [priceDollars, setPriceDollars] = useState("")
  const [compareAtDollars, setCompareAtDollars] = useState("")
  const [inventory, setInventory] = useState("0")
  const [imagesCsv, setImagesCsv] = useState("")
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [tagsCsv, setTagsCsv] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [allowCustomNote, setAllowCustomNote] = useState(true)
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")

  const [editingId, setEditingId] = useState<Id<"products"> | null>(null)
  const [deleteId, setDeleteId] = useState<Id<"products"> | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSlugManual) setSlug(slugify(name))
  }, [isSlugManual, name])

  useEffect(() => {
    if (!categoryId && categories && categories.length > 0) {
      setCategoryId(String(categories[0]._id))
    }
  }, [categories, categoryId])

  const parsed = useMemo(() => {
    const imagesFromCsv = imagesCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const tags = tagsCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const price = Number.isFinite(Number(priceDollars))
      ? Math.round(Number(priceDollars) * 100)
      : NaN

    const compareAtTrimmed = compareAtDollars.trim()
    const compareAtParsed = compareAtTrimmed ? Number.parseFloat(compareAtTrimmed) : NaN
    const compareAt = Number.isFinite(compareAtParsed)
      ? Math.round(compareAtParsed * 100)
      : undefined

    const inventoryNumber = Number.isFinite(Number(inventory))
      ? Math.floor(Number(inventory))
      : NaN

    return { imagesFromCsv, tags, price, compareAt, inventoryNumber }
  }, [compareAtDollars, imagesCsv, inventory, priceDollars, tagsCsv])

  const combinedImages = useMemo(() => {
    const all = [...uploadedImageUrls, ...parsed.imagesFromCsv].filter(Boolean)
    return Array.from(new Set(all))
  }, [parsed.imagesFromCsv, uploadedImageUrls])

  const categoryById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of categories ?? []) {
      map.set(String(c._id), c.name)
    }
    return map
  }, [categories])

  const resetForm = () => {
    setName("")
    setSlug("")
    setIsSlugManual(false)
    setShortDescription("")
    setDescription("")
    if (categories && categories.length > 0) {
      setCategoryId(String(categories[0]._id))
    } else {
      setCategoryId("")
    }
    setPriceDollars("")
    setCompareAtDollars("")
    setInventory("0")
    setImagesCsv("")
    setUploadedImageUrls([])
    setImageUploadError(null)
    setTagsCsv("")
    setIsFeatured(false)
    setIsActive(true)
    setAllowCustomNote(true)
    setMetaTitle("")
    setMetaDescription("")
    setError(null)
  }

  const openCreate = () => {
    setEditingId(null)
    resetForm()
    setIsSheetOpen(true)
  }

  const startEditing = (product: AdminProduct) => {
    setError(null)

    // Slug is considered "manual" when it isn't the auto-generated single-character placeholder.
    // This mirrors legacy behavior until we persist an explicit flag.
    const nextIsSlugManual = !(
      product.slug.length === 1 && slugify(product.name).length > 1
    )

    setEditingId(product._id)
    setName(product.name)
    setSlug(product.slug)
    setIsSlugManual(nextIsSlugManual)
    setShortDescription(product.shortDescription ?? "")
    setDescription(product.description)
    setCategoryId(String(product.categoryId))
    setPriceDollars((product.price / 100).toFixed(2))
    setCompareAtDollars(
      product.compareAtPrice ? (product.compareAtPrice / 100).toFixed(2) : ""
    )
    setInventory(String(product.inventory))
    setUploadedImageUrls(product.images)
    setImagesCsv("")
    setTagsCsv(product.tags.join(", "))
    setIsFeatured(product.isFeatured)
    setIsActive(product.isActive)
    setAllowCustomNote(product.allowCustomNote)
    setMetaTitle(product.metaTitle ?? "")
    setMetaDescription(product.metaDescription ?? "")

    setIsSheetOpen(true)
  }

  const cancelEditing = () => {
    setEditingId(null)
    resetForm()
    setIsSheetOpen(false)
  }

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return
    setImageUploadError(null)

    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (imageFiles.length === 0) {
      setImageUploadError("Please upload image files only")
      return
    }

    try {
      setIsUploadingImages(true)

      for (const file of imageFiles) {
        const postUrl: string = await generateUploadUrl()
        const result = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        })

        if (!result.ok) {
          throw new Error(`Upload failed (${result.status})`)
        }

        const json = (await result.json()) as { storageId: Id<"_storage"> }
        const url: string | null = await getUrlForStorageId({
          storageId: json.storageId,
        })

        if (!url) {
          throw new Error("Could not resolve uploaded file URL")
        }

        setUploadedImageUrls((prev) => Array.from(new Set([...prev, url])))
      }
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsUploadingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const onSave = async () => {
    setError(null)

    if (!name.trim()) {
      setError("Name is required")
      return
    }

    const normalizedSlug = slugify(slug)
    if (!normalizedSlug) {
      setError("Slug is required")
      return
    }

    if (!description.trim()) {
      setError("Description is required")
      return
    }

    if (!categoryId) {
      setError("Category is required")
      return
    }

    if (!Number.isFinite(parsed.price) || parsed.price <= 0) {
      setError("Price must be a number greater than 0")
      return
    }

    if (!Number.isFinite(parsed.inventoryNumber) || parsed.inventoryNumber < 0) {
      setError("Inventory must be 0 or greater")
      return
    }

    if (combinedImages.length === 0) {
      setError("Add at least one image (upload a file or paste an image URL)")
      return
    }

    try {
      setIsSaving(true)
      if (editingId) {
        await updateProduct({
          id: editingId,
          name: name.trim(),
          slug: normalizedSlug,
          description: description.trim(),
          shortDescription: shortDescription.trim()
            ? shortDescription.trim()
            : undefined,
          price: parsed.price,
          compareAtPrice: parsed.compareAt,
          categoryId: categoryId as Id<"categories">,
          images: combinedImages,
          isFeatured,
          isActive,
          inventory: parsed.inventoryNumber,
          tags: parsed.tags,
          allowCustomNote,
          metaTitle: metaTitle.trim() ? metaTitle.trim() : undefined,
          metaDescription: metaDescription.trim() ? metaDescription.trim() : undefined,
        })
        toast.success("Product updated")
        setIsSheetOpen(false)
        setEditingId(null)
        resetForm()
      } else {
        await createProduct({
          name: name.trim(),
          slug: normalizedSlug,
          description: description.trim(),
          shortDescription: shortDescription.trim()
            ? shortDescription.trim()
            : undefined,
          price: parsed.price,
          compareAtPrice: parsed.compareAt,
          categoryId: categoryId as Id<"categories">,
          images: combinedImages,
          isFeatured,
          isActive,
          inventory: parsed.inventoryNumber,
          tags: parsed.tags,
          allowCustomNote,
          metaTitle: metaTitle.trim() ? metaTitle.trim() : undefined,
          metaDescription: metaDescription.trim() ? metaDescription.trim() : undefined,
        })
        toast.success("Product created")
        setIsSheetOpen(false)
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async (id: Id<"products">) => {
    try {
      setDeleteId(id)
      await removeProduct({ id })
      toast.success("Product deleted")
    } catch (err) {
      toast.error("Failed to delete product")
    } finally {
      setDeleteId(null)
    }
  }

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!products) return []
    if (!searchQuery) return products
    const q = searchQuery.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q)
    )
  }, [products, searchQuery])

  if (!products) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="h-8 w-8 text-[#1d4ed8]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-h2 font-serif font-semibold text-[#002684]">
            Products
          </h1>
          <p className="text-body text-[#002684]/70">
            Manage your store's inventory
          </p>
        </div>
        <Button onClick={openCreate} className="h-10 rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Main Content */}
      <Card className="rounded-2xl shadow-sm overflow-hidden border-0 ring-1 ring-gray-200">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full bg-white border-gray-200 focus-visible:ring-[#1d4ed8]"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 ml-auto">
            <span className="font-medium text-gray-900">{filteredProducts.length}</span> products
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package className="h-8 w-8 mb-2 opacity-20" />
                      <p>No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => (
                  <TableRow key={String(p._id)} className="hover:bg-gray-50/50 border-gray-100 group">
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#002684]">{p.name}</span>
                        <span className="text-xs text-gray-500 font-mono hidden sm:inline-block">/{p.slug}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-gray-600 border-gray-200">
                        {categoryById.get(String(p.categoryId)) || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#002684]">{formatCents(p.price)}</div>
                      {p.compareAtPrice && (
                        <div className="text-xs text-gray-400 line-through">{formatCents(p.compareAtPrice)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          p.inventory === 0 ? "text-red-600" :
                            p.inventory < 10 ? "text-amber-600" : "text-gray-700"
                        )}>
                          {p.inventory}
                        </span>
                        {p.inventory === 0 && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">OOS</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge className={cn(
                          "h-5 px-1.5 text-[10px] font-medium border-0",
                          p.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                        )}>
                          {p.isActive ? "Active" : "Draft"}
                        </Badge>
                        {p.isFeatured && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-amber-600 border-amber-200 bg-amber-50">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditing(p)}
                          className="h-8 w-8 text-gray-500 hover:text-[#1d4ed8] hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1d4ed8]/70"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600/70"
                              disabled={deleteId === p._id}
                              aria-busy={deleteId === p._id}
                            >
                              {deleteId === p._id ? (
                                <Spinner className="h-4 w-4 text-red-500" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove <strong>{p.name}</strong> from the store.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(p._id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteId === p._id}
                              >
                                {deleteId === p._id ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-serif text-[#002684]">
              {editingId ? "Edit Product" : "New Product"}
            </SheetTitle>
            <SheetDescription className="text-sm-fluid text-muted-foreground">
              {editingId
                ? `Update details for ${name || "this product"}.`
                : "Create or edit product details."}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea
            className="pr-4"
            style={
              {
                "--sheet-content-offset": "180px",
                height: "calc(100vh - var(--sheet-content-offset))",
              } as CSSProperties
            }
          >
            <div
              className="flex flex-col gap-6"
              style={
                {
                  "--sheet-content-bottom-padding": "5rem",
                  paddingBottom: "var(--sheet-content-bottom-padding)",
                } as CSSProperties
              }
            >
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Core Info */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                    <Input
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsSlugManual(true)
                      }}
                      className="pl-6 font-mono text-sm"
                      placeholder="product-slug"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={String(c._id)} value={String(c._id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 h-10 border rounded-md px-3 bg-white">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <span className="text-sm font-medium text-gray-600">{isActive ? "Active" : "Draft"}</span>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} className="pl-7" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Compare At</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input value={compareAtDollars} onChange={(e) => setCompareAtDollars(e.target.value)} className="pl-7" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Inventory</Label>
                  <Input value={inventory} onChange={(e) => setInventory(e.target.value)} type="number" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Short Description</Label>
                  <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="h-20" placeholder="Brief description for listings" />
                </div>
                <div className="grid gap-2">
                  <Label>Full Description</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-32" placeholder="Detailed product description" />
                </div>
              </div>

              {/* Images */}
              <div className="grid gap-2">
                <Label>Images</Label>
                <div className="grid grid-cols-3 gap-3 mb-2">
                  {uploadedImageUrls.map((url) => (
                    <div key={url} className="relative aspect-square rounded-lg border overflow-hidden group/img">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setUploadedImageUrls(prev => prev.filter(u => u !== url))}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImages}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#1d4ed8] hover:text-[#1d4ed8] hover:bg-blue-50 transition-colors"
                  >
                    {isUploadingImages ? <Spinner className="h-6 w-6" /> : (
                      <>
                        <Plus className="h-6 w-6" />
                        <span className="text-xs font-medium">Add Image</span>
                      </>
                    )}
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))} />
                <Textarea
                  value={imagesCsv}
                  onChange={(e) => setImagesCsv(e.target.value)}
                  placeholder="Or paste image URLs (comma-separated)..."
                  className="h-16 text-sm"
                />
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} placeholder="holiday, chocolate, premium" />
              </div>

              {/* Settings */}
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Featured Product</Label>
                    <p className="text-xs text-muted-foreground">Display this product on the home page.</p>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Allow Custom Notes</Label>
                    <p className="text-xs text-muted-foreground">Customers can add a gift message.</p>
                  </div>
                  <Switch checked={allowCustomNote} onCheckedChange={setAllowCustomNote} />
                </div>
              </div>

              {/* SEO */}
              <div className="border-t pt-4 space-y-4">
                <p className="text-sm font-medium text-muted-foreground">SEO Settings</p>
                <div className="grid gap-2">
                  <Label>Meta Title</Label>
                  <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Page title for search engines" />
                </div>
                <div className="grid gap-2">
                  <Label>Meta Description</Label>
                  <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className="h-20" placeholder="Short description for search engines" />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={cancelEditing}>Cancel</Button>
            <Button className="flex-1 bg-[#1d4ed8]" onClick={onSave} disabled={isSaving}>
              {isSaving && <Spinner className="mr-2 h-4 w-4" />}
              {editingId ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
