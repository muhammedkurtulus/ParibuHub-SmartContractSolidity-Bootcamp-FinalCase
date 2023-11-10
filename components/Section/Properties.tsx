import {
  buttonGroupClass,
  cardClass,
  listClass,
  propertyTypeClass,
} from "@/app/classes";
import { PropertyInfo, PropertyType, Status } from "@/app/types";
import { useUserContext } from "@/providers/UserContextProvider";
import { contract } from "@/providers/WalletProvider";
import { House, Storefront } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useEffect } from "react";
import { zeroAddress } from "viem";
import { useAccount, useContractRead } from "wagmi";

export const Properties = () => {
  const { setOpenStartLeaseForm, setSelectedProperty, setOpenLeaseInfo } =
    useUserContext();

  const { data: properties } = useContractRead({
    ...contract,
    functionName: "getAllProperties",
  });

  const { data: complaints } = useContractRead({
    ...contract,
    functionName: "getAllComplaints",
  });

  const { address } = useAccount();

  return (
    properties &&
    properties.length > 0 && (
      <div className={listClass}>
        {properties.map((property: PropertyInfo) => {
          const isBanned = complaints?.some(
            (c) => c.whoAbout === property.owner && c.status === Status.confirm
          );
          if (property.isListed && !isBanned) {
            return (
              <div className={cardClass}>
                <div className={propertyTypeClass}>
                  {property.propertyType === PropertyType.House ? (
                    <House />
                  ) : (
                    <Storefront />
                  )}
                  {property.owner === address
                    ? "Owner"
                    : property.leaseInfo.tenantAddress === address
                    ? "Tenant"
                    : undefined}
                </div>

                <div>
                  <p>Property Address: {property.propertyAddress}</p>
                  <p>Owner Name: {property.ownerName}</p>
                  <p>Owner Address: {property.owner}</p>
                  <p>Index: {Number(property.propertyIndex)}</p>
                </div>

                <div className={buttonGroupClass}>
                  {property.leaseInfo.isActive && (
                    <Button
                      onClick={() => {
                        setSelectedProperty(property);
                        setOpenLeaseInfo(true);
                      }}
                      variant="contained"
                      size="small"
                      color="secondary"
                    >
                      View Lease
                    </Button>
                  )}

                  {!property.leaseInfo.isActive &&
                    property.owner !== address && (
                      <Button
                        onClick={() => {
                          setSelectedProperty(property);
                          setOpenStartLeaseForm({
                            opened: true,
                            fromTenant: true,
                          });
                        }}
                        variant="contained"
                        size="small"
                        disabled={
                          property.leaseInfo.tenantAddress !== zeroAddress ||
                          !address
                        }
                      >
                        Start Lease
                      </Button>
                    )}
                </div>
              </div>
            );
          }
        })}
      </div>
    )
  );
};
