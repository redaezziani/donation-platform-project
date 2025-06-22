import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVerticalIcon,
  FileTextIcon,
  MailIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCardIcon,
  CircleDollarSignIcon,
  BanknoteIcon,
  WalletIcon,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import PaginationComponent from "../../components/PaginationComponent";
import { adminAPI, paymentAPI } from "../../lib/api";

const getStatusBadgeProps = (status) => {
  switch (status) {
    case "completed":
      return { variant: "success", label: "مكتمل" };
    case "pending":
      return { variant: "warning", label: "قيد المعالجة" };
    case "failed":
      return { variant: "destructive", label: "فشل" };
    default:
      return { variant: "outline", label: status };
  }
};

const getPaymentMethodIcon = (method) => {
  switch (method) {
    case "credit_card":
      return { icon: CreditCardIcon, label: "بطاقة ائتمان" };
    case "bank_transfer":
      return { icon: BanknoteIcon, label: "تحويل بنكي" };
    case "paypal":
      return { icon: WalletIcon, label: "PayPal" };
    case "wallet":
      return { icon: WalletIcon, label: "محفظة إلكترونية" };
    default:
      return { icon: CreditCardIcon, label: method };
  }
};

const AdminDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    averageDonation: 0,
    pendingDonations: 0,
  });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch campaigns first
      const campaignsResponse = await adminAPI.getAllCampaigns(1, 100); // Get all campaigns
      const campaignsData = campaignsResponse.items || [];
      setCampaigns(campaignsData);

      // Collect donations from all campaigns
      const allDonations = [];
      for (const campaign of campaignsData) {
        try {
          const campaignDonations = await paymentAPI.getCampaignDonations(
            campaign.id
          );

          // Transform donations to match the expected format
          const transformedDonations = campaignDonations.map((donation) => ({
            id: `D${donation.id}`,
            amount: donation.amount,
            donor:
              donation.donor_name ||
              (donation.is_anonymous ? "متبرع مجهول" : "غير محدد"),
            email: donation.is_anonymous
              ? "مخفي"
              : donation.donor_email || "غير محدد",
            campaign: campaign.title,
            campaignId: campaign.id,
            status: donation.payment_status || "completed",
            method: donation.payment_method || "credit_card",
            date: donation.created_at,
            anonymous: donation.is_anonymous || false,
          }));

          allDonations.push(...transformedDonations);
        } catch (err) {
          console.warn(
            `Could not fetch donations for campaign ${campaign.id}:`,
            err
          );
        }
      }

      setDonations(allDonations);

      // Calculate stats
      const completedDonations = allDonations.filter(
        (d) => d.status === "completed"
      );
      const totalAmount = completedDonations.reduce(
        (sum, d) => sum + d.amount,
        0
      );

      setStats({
        totalDonations: completedDonations.length,
        totalAmount,
        averageDonation:
          completedDonations.length > 0
            ? totalAmount / completedDonations.length
            : 0,
        pendingDonations: allDonations.filter((d) => d.status === "pending")
          .length,
      });

      // For now, we'll use client-side pagination since we don't have server-side pagination for donations
      setTotalPages(Math.ceil(allDonations.length / 10));
    } catch (err) {
      console.error("Error fetching donations data:", err);
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get unique campaigns for filter
  const uniqueCampaigns = [...new Set(donations.map((d) => d.campaignId))].map(
    (id) => {
      const donation = donations.find((d) => d.campaignId === id);
      return { id, name: donation?.campaign || `Campaign ${id}` };
    }
  );

  // Sort function
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Filter and sort donations
  const filteredDonations = donations
    .filter((donation) => {
      const matchesSearch =
        donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || donation.status === statusFilter;
      const matchesCampaign =
        campaignFilter === "all" ||
        donation.campaignId.toString() === campaignFilter;

      return matchesSearch && matchesStatus && matchesCampaign;
    })
    .sort((a, b) => {
      if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc"
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      if (sortConfig.key === "date") {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  // Paginate filtered results
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التبرعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة التبرعات</h1>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

{/* Statistics Cards */}
<div className="grid grid-cols-1 border border-border md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg">
  <Card
  className={"border-none"}
  >
    <CardContent className="p-4 flex items-center gap-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <BanknoteIcon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">إجمالي التبرعات</p>
        <p className="text-2xl font-bold">{stats.totalDonations}</p>
      </div>
    </CardContent>
  </Card>

  <Card
  className={"border-none"}
  >
    <CardContent className="p-4 flex items-center gap-4 ">
      <div className="bg-primary/10 p-3 rounded-full">
        <CircleDollarSignIcon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
        <p className="text-2xl font-bold">
          {formatCurrency(stats.totalAmount)}
        </p>
      </div>
    </CardContent>
  </Card>

  <Card
  className={"border-none"}
  >
    <CardContent className="p-4 flex items-center gap-4 ">
      <div className="bg-primary/10 p-3 rounded-full">
        <ArrowUpIcon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">متوسط التبرع</p>
        <p className="text-2xl font-bold">
          {formatCurrency(stats.averageDonation)}
        </p>
      </div>
    </CardContent>
  </Card>

  <Card
  className={"border-none"}
  >
    <CardContent className="p-4 flex items-center gap-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <ArrowDownIcon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">قيد المعالجة</p>
        <p className="text-2xl font-bold">{stats.pendingDonations}</p>
      </div>
    </CardContent>
  </Card>
</div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="بحث عن رقم التبرع أو المتبرع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            prefix={<Search className="h-4 w-4 ml-2 text-muted-foreground" />}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="w-1/2 md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="pending">قيد المعالجة</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/2 md:w-auto">
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="الحملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحملات</SelectItem>
                {uniqueCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("id")}
              >
                رقم التبرع
                {sortConfig.key === "id" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpIcon className="inline h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="inline h-4 w-4 mr-1" />
                  ))}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                التاريخ
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpIcon className="inline h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="inline h-4 w-4 mr-1" />
                  ))}
              </TableHead>
              <TableHead>المتبرع</TableHead>
              <TableHead>الحملة</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                المبلغ
                {sortConfig.key === "amount" &&
                  (sortConfig.direction === "asc" ? (
                    <ArrowUpIcon className="inline h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="inline h-4 w-4 mr-1" />
                  ))}
              </TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDonations.map((donation) => {
              const statusProps = getStatusBadgeProps(donation.status);
              const methodInfo = getPaymentMethodIcon(donation.method);
              const PaymentIcon = methodInfo.icon;

              return (
                <TableRow key={donation.id}>
                  <TableCell className="font-mono">{donation.id}</TableCell>
                  <TableCell>{formatDate(donation.date)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {donation.anonymous ? "متبرع مجهول" : donation.donor}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {donation.anonymous ? "" : donation.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="max-w-[150px] truncate"
                    title={donation.campaign}
                  >
                    {donation.campaign}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(donation.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{methodInfo.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusProps.variant}>
                      {statusProps.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex gap-2">
                          <FileTextIcon className="h-4 w-4" />
                          <span>إيصال التبرع</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex gap-2">
                          <MailIcon className="h-4 w-4" />
                          <span>إرسال رسالة شكر</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex gap-2 text-destructive">
                          <ArrowDownIcon className="h-4 w-4" />
                          <span>رد المبلغ</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDonations.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد تبرعات"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {Math.ceil(filteredDonations.length / 10) > 1 && (
        <div className="flex justify-end">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={Math.ceil(filteredDonations.length / 10)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminDonationsPage;
