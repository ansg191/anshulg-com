export enum ServiceStatus {
  UNKNOWN,
  DOWN,
  UP,
  PENDING,
  MAINTENANCE,
}

export namespace ServiceStatus {
  export function toColorClass(status: ServiceStatus): string {
    switch (status) {
      case ServiceStatus.UNKNOWN:
        return "bg-gray-500";
      case ServiceStatus.DOWN:
        return "bg-red-500";
      case ServiceStatus.UP:
        return "bg-green-500";
      case ServiceStatus.PENDING:
        return "bg-yellow-500";
      case ServiceStatus.MAINTENANCE:
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  }

  export function toHumanReadable(status: ServiceStatus): string {
    switch (status) {
      case ServiceStatus.UNKNOWN:
        return "Unknown";
      case ServiceStatus.DOWN:
        return "Down";
      case ServiceStatus.UP:
        return "Up";
      case ServiceStatus.PENDING:
        return "Pending";
      case ServiceStatus.MAINTENANCE:
        return "Under Maintenance";
      default:
        return "Unknown";
    }
  }
}
